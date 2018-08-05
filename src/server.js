// This example uses React Router v4, although it should work
// equally well with other routers that support SSR

import { ApolloProvider, renderToStringWithData } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import Express from 'express';
import { StaticRouter } from 'react-router';
import { InMemoryCache } from "apollo-cache-inmemory";

import Layout from './src/routes/Layout';

let PORT = 8080;
if (process.env.PORT) {
  PORT = parseInt(process.env.PORT, 10);
}

const app = new Express();
app.use((req, res) => {
  const client = new ApolloClient({
    ssrMode: true,
    // Remember that this is the interface the SSR server will use to connect to the
    // API server, so we need to ensure it isn't firewalled, etc
    link: new HttpLink({uri: "https://writing-be.natwelch.com/graphql"}),
    cache: new InMemoryCache()
  });

  const context = {};

  // The client-side app will instead use <BrowserRouter>
  const app = (
    <ApolloProvider client={client}>
      <StaticRouter location={req.url} context={context}>
        <Layout />
      </StaticRouter>
    </ApolloProvider>
  );

  // rendering code
  renderToStringWithData(app).then((content) => {
    const initialState = client.extract();
    const html = <Html content={content} state={initialState} />;

    res.status(200);
    res.send(`<!doctype html>\n${ReactDOM.renderToStaticMarkup(html)}`);
    res.end();
  });

});

app.listen(PORT, () => console.log( // eslint-disable-line no-console
  `App Server is now running on http://localhost:${PORT}`
));
