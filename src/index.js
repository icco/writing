import React from 'react';
import ReactDOM from 'react-dom';
import { browserHistory } from 'react-router';
import { unregister } from './registerServiceWorker';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloProvider } from 'react-apollo';
import ReactGA from 'react-ga';
import Routes from './routes';

ReactGA.initialize('UA-333449-17');

function logPageView() {
  ReactGA.set({ page: window.location.pathname + window.location.search });
  ReactGA.pageview(window.location.pathname + window.location.search);
}

const client = new ApolloClient({
  link: new HttpLink({uri: "https://writing-be.natwelch.com/graphql"}),
  cache: new InMemoryCache()
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <Routes history={browserHistory} onUpdate={logPageView} />
  </ApolloProvider>,
 document.getElementById('root')
);
unregister();
