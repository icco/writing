'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { browserHistory } from 'react-router';
import { unregister } from './registerServiceWorker';
import ReactGA from 'react-ga';
import Routes from './routes';

ReactGA.initialize('UA-333449-17');

function logPageView() {
  ReactGA.set({ page: window.location.pathname + window.location.search });
  ReactGA.pageview(window.location.pathname + window.location.search);
}

ReactDOM.render(
 <Routes history={browserHistory} onUpdate={logPageView} />,
 document.getElementById('root')
);
unregister();
