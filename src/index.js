'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { browserHistory } from 'react-router';
import { unregister } from './registerServiceWorker';

import Routes from './routes';

unregister();

ReactDOM.render(
 <Routes history={browserHistory} />,
 document.getElementById('root')
);
