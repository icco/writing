import React from 'react';
import { Router, IndexRoute, Route } from 'react-router';

import App from './App';
import Home from './Home';
import About from './About';
import PostComponent from './Post';

const Routes = (props) => (
  <Router {...props}>
  <Route path="/" component={App}>
  <IndexRoute component={Home} />
  <Route path="/p/:page" component={Home} />
  <Route path="/post/:slug" component={PostComponent} />
  <Route path="/about" component={About} />
  </Route>
  </Router>
);

export default Routes;
