"use strict";

const {
  SSLMiddleware,
  NELMiddleware,
  ReportToMiddleware,
} = require("@icco/react-common");
const compression = require("compression");
const express = require("express");
const helmet = require("helmet");
const expectCt = require("expect-ct");
const next = require("next");
const rss = require("feed");
const gql = require("graphql-tag");
const { parse } = require("url");
const { join } = require("path");
const opencensus = require("@opencensus/core");
const tracing = require("@opencensus/nodejs");
const stackdriver = require("@opencensus/exporter-stackdriver");
const propagation = require("@opencensus/propagation-stackdriver");
const sitemap = require("sitemap");
const pinoMiddleware = require("pino-http");

const md = require("./lib/markdown.js");
const { logger } = require("./lib/logger.js");

const GOOGLE_PROJECT = "icco-cloud";
const port = parseInt(process.env.PORT, 10) || 8080;
const dev = process.env.NODE_ENV !== "production";

async function startServer() {
  if (process.env.ENABLE_STACKDRIVER) {
    const sse = new stackdriver.StackdriverStatsExporter({
      projectId: GOOGLE_PROJECT,
    });
    opencensus.globalStats.registerExporter(sse);

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

      server.get('/service-worker.js', (req, res) => {
        const parsedUrl = parse(req.url, true);
        const filePath = join(__dirname, '.next', parsedUrl.pathname)
        app.serveStatic(req, res, filePath)
      })

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
