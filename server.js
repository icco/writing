"use strict";

const express = require("express");
const helmet = require("helmet");
const next = require("next");
const rss = require("feed");
const gql = require("graphql-tag");
const apollo = require("./lib/apollo.js");
const { parse } = require("url");
const { join } = require("path");
const logger = require("pino")({ level: "debug" });
const pino = require("express-pino-logger")();
const opencensus = require("@opencensus/core");
const proxy = require("http-proxy-middleware");
const propagation = require("@opencensus/propagation-b3");
const tracing = require("@opencensus/nodejs");
const stackdriver = require("@opencensus/exporter-stackdriver");

if (process.env.ENABLE_STACKDRIVER) {
  const sdp = propagation.v1;
  const stats = new opencensus.Stats();
  const sse = new stackdriver.StackdriverStatsExporter({
    projectId: "icco-cloud",
    prefix: "writing",
  });
  stats.registerExporter(sse);
  const exporter = new stackdriver.StackdriverTraceExporter({
    projectId: "icco-cloud",
    prefix: "writing",
  });
  tracing.start({
    samplingRate: 1,
    plugins: {
      http: "@opencensus/instrumentation-http",
    },
    logLevel: 4,
    logger: logger,
    exporter: exporter,
    propagation: sdp,
  });
}

const app = next({
  dir: ".",
  dev: process.env.NODE_ENV !== "production",
});

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

app
  .prepare()
  .then(() => {
    const server = express();

    server.use(pino);
    server.use(helmet());

    server.get("/post/:id", (req, res) => {
      const actualPage = "/post";
      const queryParams = { id: req.params.id };
      app.render(req, res, actualPage, queryParams);
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
      target: "https://graphql.natwelch.com",
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
      console.log("> Ready on http://localhost:8080");
    });
  })
  .catch(ex => {
    console.error(ex.stack);
    process.exit(1);
  });
