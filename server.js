"use strict";

const express = require("express");
const helmet = require("helmet");
const next = require("next");
const rss = require("feed");
const gql = require("graphql-tag");
const apollo = require("./lib/apollo.js");
const { parse } = require("url");
const { join } = require("path");
const opencensus = require("@opencensus/core");
const proxy = require("http-proxy-middleware");
const tracing = require("@opencensus/nodejs");
const stackdriver = require("@opencensus/exporter-stackdriver");
const propagation = require("@opencensus/propagation-stackdriver");
const bunyan = require("bunyan");
const onFinished = require("on-finished");

const GOOGLE_PROJECT = "icco-cloud";
const { GRAPHQL_ORIGIN = "https://graphql.natwelch.com" } = process.env;

async function recentPosts() {
  try {
    const client = apollo.create();
    let data = await client.query({
      query: gql`
        query recentPosts {
          posts(limit: 20, offset: 0) {
            id
            title
            datetime
            summary
          }
        }
      `,
    });

    return data.data.posts;
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function generateFeed() {
  let feed = new rss.Feed({
    title: "Nat? Nat. Nat!",
    favicon: "https://writing.natwelch.com/favicon.ico",
    description: "Nat Welch's Blog about random stuff.",
  });
  try {
    let data = await recentPosts();

    data.forEach(p => {
      feed.addItem({
        title: p.title,
        link: `https://writing.natwelch.com/post/${p.id}`,
        date: new Date(p.datetime),
        content: p.summary,
        author: [
          {
            name: "Nat Welch",
            email: "nat@natwelch.com",
            link: "https://natwelch.com",
          },
        ],
      });
    });
  } catch (err) {
    console.error(err);
  }

  return feed;
}

async function stackdriverMiddleware(logger, extract) {
  function makeChildLogger(trace) {
    return logger.child({ "logging.googleapis.com/trace": trace }, true);
  }

  function makeHttpRequestData(req, res, latencyMilliseconds) {
    return {
      status: res.statusCode,
      requestUrl: req.url,
      requestMethod: req.method,
      userAgent: req.headers["user-agent"],
      responseSize:
        (res.getHeader && Number(res.getHeader("Content-Length"))) || 0,
      latency: {
        seconds: Math.floor(latencyMilliseconds / 1e3),
        nanos: Math.floor((latencyMilliseconds % 1e3) * 1e6),
      },
    };
  }

  return (req, res, next) => {
    const requestStartMs = Date.now();

    let trace = "";
    if (extract !== undefined) {
      const spanContext = extract({
        getHeader: function(name) {
          return req.headers[name];
        },
      });
      trace = `projects/${GOOGLE_PROJECT}/traces/${spanContext.traceId}`;
    }

    // Install a child logger on the request object.
    req.log = makeChildLogger(trace);

    // Emit a 'Request Log' on the parent logger.
    onFinished(res, () => {
      const latencyMs = Date.now() - requestStartMs;
      const httpRequest = makeHttpRequestData(req, res, latencyMs);
      logger.info({ httpRequest, trace });
    });

    next();
  };
}

async function startServer() {
  const logger = bunyan.createLogger({
    name: "writing",
    level: "info",
    // TODO: change to a function that formats like stackdriver likes
    streams: [{ stream: process.stdout }],
  });

  let mw = await stackdriverMiddleware(logger);

  if (process.env.ENABLE_STACKDRIVER) {
    const stats = new opencensus.Stats();
    const sse = new stackdriver.StackdriverStatsExporter({
      projectId: GOOGLE_PROJECT,
    });
    stats.registerExporter(sse);

    const sp = propagation.v1;
    const ste = new stackdriver.StackdriverTraceExporter({
      projectId: GOOGLE_PROJECT,
    });
    const tracer = tracing.start({
      samplingRate: 1,
      logger: logger,
      exporter: ste,
      propagation: sp,
    }).tracer;

    tracer.startRootSpan({ name: "init" }, rootSpan => {
      for (let i = 0; i < 1000000; i++) {}

      rootSpan.end();
    });

    mw = await stackdriverMiddleware(logger, sp.extract);
  }

  const app = next({
    dir: ".",
    dev: process.env.NODE_ENV !== "production",
  });

  app
    .prepare()
    .then(() => {
      const server = express();

      server.use(mw);
      server.use(helmet());

      server.get("/healthz", (req, res) => {
        res.json({ status: "ok" });
      });

      server.get("/post/:id", (req, res) => {
        const actualPage = "/post";
        const queryParams = { id: req.params.id };
        app.render(req, res, actualPage, queryParams);
      });

      server.get("/tags/:id", (req, res) => {
        res.redirect(`/tag/${req.params.id}`);
      });

      server.get("/tag/:id", (req, res) => {
        const actualPage = "/tag";
        const queryParams = { id: req.params.id };
        app.render(req, res, actualPage, queryParams);
      });

      server.get("/feed.rss", async (req, res) => {
        let feed = await generateFeed();
        res.set("Content-Type", "application/rss+xml");
        res.send(feed.rss2());
      });

      server.get("/feed.atom", async (req, res) => {
        let feed = await generateFeed();
        res.set("Content-Type", "application/atom+xml");
        res.send(feed.atom1());
      });

      const graphqlProxy = proxy({
        target: GRAPHQL_ORIGIN,
        changeOrigin: true,
      });
      server.use(
        ["/login", "/logout", "/callback", "/admin/?*", "/graphql"],
        graphqlProxy
      );

      server.all("*", (req, res) => {
        const handle = app.getRequestHandler();
        const parsedUrl = parse(req.url, true);
        const rootStaticFiles = [
          "/robots.txt",
          "/sitemap.xml",
          "/favicon.ico",
          "/.well-known/brave-payments-verification.txt",
        ];

        const redirects = {};

        if (parsedUrl.pathname in redirects) {
          return res.redirect(redirects[parsedUrl.pathname]);
        }

        if (rootStaticFiles.indexOf(parsedUrl.pathname) > -1) {
          const path = join(__dirname, "static", parsedUrl.pathname);
          app.serveStatic(req, res, path);
        } else {
          handle(req, res, parsedUrl);
        }
        return;
      });

      server.listen(8080, "0.0.0.0", err => {
        if (err) throw err;
        logger.info("> Ready on http://localhost:8080");
      });
    })
    .catch(ex => {
      logger.error(ex.stack);
      process.exit(1);
    });
}

startServer();
