
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from './store';
import Router from './router';

const rootElement = document.getElementById('root')
ReactDOM.render(
  <Provider store={store}>
    <Router />
  </Provider>,
  rootElement
)