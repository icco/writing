import { Route, Switch } from 'react-router';
import { Link } from 'react-router-dom';
import React from 'react';

// A Routes file is a good shared entry-point between client and server
import routes from './routes';

const Layout = () =>
  <div>
    {/* New <Switch> behavior introduced in React Router v4
       https://reacttraining.com/react-router/web/api/Switch */}
    <Switch>
      {routes.map(route => <Route key={route.name} {...route} />)}
    </Switch>
  </div>;

export default Layout;
