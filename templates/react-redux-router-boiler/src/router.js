import React from 'react';
import { HashRouter, Switch, Route } from 'react-router-dom';
import App from './App';

const Router = () => (
  <HashRouter>
    <Switch>
      <Route exact path="/">
        <App />
      </Route>
      <Route>
        404
      </Route>
    </Switch>
  </HashRouter>
);

export default Router;