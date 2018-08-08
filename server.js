const express = require("express");
const next = require("next");
const rss = require("rss");
const gql = require("graphql-tag");
const apollo = require("./lib/apollo.js");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = express();

    server.get("/post/:id", (req, res) => {
      const actualPage = "/post";
      const queryParams = { id: req.params.id };
      app.render(req, res, actualPage, queryParams);
    });

    server.get("/feed.rss", (req, res) => {
      const client = apollo.create();
      client
        .query({
          query: gql`
            query allPosts {
              allPosts {
                id
                title
                datetime
              }
            }
          `
        })
        .then(data => {
         console.log( data.data.allPosts)
        });

      res.send("hello");
    });

    server.get("*", (req, res) => {
      return handle(req, res);
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
