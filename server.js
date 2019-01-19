"use strict";

const express = require("express");
const helmet = require("helmet");
const next = require("next");
const rss = require("feed");
const gql = require("graphql-tag");
const apollo = require("./lib/init-apollo.js");
const { parse } = require("url");
const { join } = require("path");
const opencensus = require("@opencensus/core");
const proxy = require("http-proxy-middleware");
const tracing = require("@opencensus/nodejs");
const stackdriver = require("@opencensus/exporter-stackdriver");
const propagation = require("@opencensus/propagation-stackdriver");
const instru = require("@opencensus/instrumentation-all");
const onFinished = require("on-finished");
const sitemap = require("sitemap");
const pinoLogger = require("pino");
const pinoMiddleware = require("pino-http");
const pinoStackdriver = require("pino-stackdriver-serializers");

const GOOGLE_PROJECT = "icco-cloud";
const { GRAPHQL_ORIGIN = "https://graphql.natwelch.com" } = process.env;

async function recentPosts(logger) {
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
    logger.error(err);
    return [];
  }
}

async function mostPosts(logger) {
  try {
    const client = apollo.create();
    let data = await client.query({
      query: gql`
        query mostPosts {
          posts(limit: 1000, offset: 0) {
            id
          }
        }
      `,
    });

    return data.data.posts;
  } catch (err) {
    logger.error(err);
    return [];
  }
}

async function generateFeed(logger) {
  let feed = new rss.Feed({
    title: "Nat? Nat. Nat!",
    favicon: "https://writing.natwelch.com/favicon.ico",
    description: "Nat Welch's Blog about random stuff.",
  });
  try {
    let data = await recentPosts(logger);

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
    logger.error(err);
  }

  return feed;
}

async function generateSitemap(logger) {
  let postIds = await mostPosts(logger);
  let urls = postIds.map(function(x) {
    return { url: `/post/${x.id}` };
  });
  urls.push({ url: "/" });
  return sitemap.createSitemap({
    hostname: "https://writing.natwelch.com",
    cacheTime: 6000000, // 600 sec - cache purge period
    urls,
  });
}
async function startServer() {
  const logger = pinoLogger({
    messageKey: "message",
    level: "info",
    base: null,
    prettyPrint: {
      doSomething: true,
    },
    prettifier: pinoStackdriver.sdPrettifier,
  });

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
  }

  const app = next({
    dir: ".",
    dev: process.env.NODE_ENV !== "production",
  });

  app
    .prepare()
    .then(() => {
      const server = express();

      server.use(
        pinoMiddleware({
          logger,
        })
      );
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
        let feed = await generateFeed(logger);
        res.set("Content-Type", "application/rss+xml");
        res.send(feed.rss2());
      });

      server.get("/feed.atom", async (req, res) => {
        let feed = await generateFeed(logger);
        res.set("Content-Type", "application/atom+xml");
        res.send(feed.atom1());
      });

      server.get("/sitemap.xml", async (req, res) => {
        let sm = await generateSitemap(logger);
        sm.toXML(function(err, xml) {
          if (err) {
            logger.error(err);
            return res.status(500).end();
          }
          res.header("Content-Type", "application/xml");
          res.send(xml);
        });
      });

      const graphqlProxy = proxy({
        target: GRAPHQL_ORIGIN,
        changeOrigin: true,
        logProvider: function(provider) {
          return logger;
        },
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

        if (
          rootStaticFiles.indexOf(parsedUrl.pathname) > -1 ||
          parsedUrl.pathname.match(/^\/.*\.svg/)
        ) {
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
