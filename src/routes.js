import React from 'react';
import { Router, IndexRoute, Route } from 'react-router';

import App from './App';
import Home from './Home';
import Post from './Post';

const Routes = (props) => (
  <Router {...props}>
  <Route path="/" component={App}>
  <IndexRoute component={Home} />
  <Route path="/p/:page" component={Home} />
  <Route path="/post/:slug" component={Post} />
  </Route>
  </Router>
);

export default Routes;
