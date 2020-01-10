import {
  SSLMiddleware,
  NELMiddleware,
  ReportToMiddleware,
} from "@icco/react-common";
import compression from "compression";
import express from "express";
import helmet from "helmet";
import expectCt from "expect-ct";
import next from "next";
import { parse } from "url";
import { join } from "path";
import { globalStats } from "@opencensus/core";
import tracing from "@opencensus/nodejs";
import {
  StackdriverStatsExporter,
  StackdriverTraceExporter,
} from "@opencensus/exporter-stackdriver";
import { v1 } from "@opencensus/propagation-stackdriver";
import pinoMiddleware from "pino-http";

import { logger } from "./lib/logger.js";
import generateFeed from "./lib/feed";
import generateSitemap from "./lib/sitemap";

const GOOGLE_PROJECT = "icco-cloud";
const port = parseInt(process.env.PORT, 10) || 8080;
const dev = process.env.NODE_ENV !== "production";

async function startServer() {
  if (process.env.ENABLE_STACKDRIVER) {
    const sse = new StackdriverStatsExporter({
      projectId: GOOGLE_PROJECT,
    });
    globalStats.registerExporter(sse);

    const ste = new StackdriverTraceExporter({
      projectId: GOOGLE_PROJECT,
    });
    const tracer = tracing.start({
      samplingRate: 1,
      logger: logger,
      exporter: ste,
      propagation: v1,
    }).tracer;

    tracer.startRootSpan({ name: "init" }, rootSpan => {
      for (let i = 0; i < 1000000; i++) {}

      rootSpan.end();
    });
  }

  const app = next({
    dir: ".",
    dev,
  });

  app
    .prepare()
    .then(() => {
      const server = express();
      server.set("trust proxy", true);
      server.set("x-powered-by", false);

      server.use(
        pinoMiddleware({
          logger,
        })
      );

      server.use(NELMiddleware());
      server.use(ReportToMiddleware("writing"));

      server.use(helmet());

      server.use(
        helmet.referrerPolicy({ policy: "strict-origin-when-cross-origin" })
      );
      let directives = {
        upgradeInsecureRequests: true,

        //  default-src 'none'
        defaultSrc: [
          "'self'",
          "https://graphql.natwelch.com/graphql",
          "https://graphql.natwelch.com/photo/new",
          "https://icco.auth0.com/",
        ],
        // style-src 'self' 'unsafe-inline' https://fonts.googleapis.com/
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com/",
        ],
        // font-src https://fonts.gstatic.com
        fontSrc: ["https://fonts.gstatic.com"],
        // img-src 'self' data: http://a.natwelch.com https://a.natwelch.com https://icco.imgix.net
        imgSrc: [
          "'self'",
          "blob:",
          "data:",
          "https://a.natwelch.com",
          "https://icco.imgix.net",
          "https://storage.googleapis.com",
          "https://writing.natwelch.com",
        ],
        // script-src 'self' 'unsafe-eval' 'unsafe-inline' http://a.natwelch.com/tracker.js https://a.natwelch.com/tracker.js
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://a.natwelch.com/tracker.js",
        ],
        // object-src 'none';
        objectSrc: ["'none'"],
        // https://developers.google.com/web/updates/2018/09/reportingapi#csp
        reportUri: "https://reportd.natwelch.com/report/writing",
        reportTo: "default",
      };

      if (dev) {
        directives.defaultSrc.push("http://localhost:9393");
      }

      server.use(
        helmet.contentSecurityPolicy({
          directives,
        })
      );

      server.use(expectCt({ maxAge: 123 }));

      server.use(compression());

      server.use(SSLMiddleware());

      server.get("/healthz", (req, res) => {
        res.json({ status: "ok" });
      });

      server.get("/about", (req, res) => {
        res.redirect("https://natwelch.com");
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

      server.get("/sitemap.xml", async (req, res) => {
        res.header("Content-Type", "application/xml");
        res.header("Content-Encoding", "gzip");
        try {
          let sm = await generateSitemap();
          sm.pipe(res).on("error", e => {
            throw e;
          });
        } catch (e) {
          console.error(e);
          res.status(500).end();
        }
      });

      server.all("*", (req, res) => {
        const handle = app.getRequestHandler();
        const parsedUrl = parse(req.url, true);

        const redirects = {};

        if (parsedUrl.pathname in redirects) {
          return res.redirect(redirects[parsedUrl.pathname]);
        }

        return handle(req, res, parsedUrl);
      });

      server.listen(port, err => {
        if (err) throw err;
      });
    })
    .catch(ex => {
      logger.error(ex);
      process.exit(1);
    });
}

logger.info(`> Ready on http://localhost:${port}`);
startServer();
