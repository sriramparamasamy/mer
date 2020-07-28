import React, { Fragment, useEffect } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Navbar from "./components/layouts/Navbar";
import Landing from "./components/layouts/Landing";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Alert from "./components/layouts/Alert";
//Redux
import { Provider } from "react-redux";
import store from "./store";
import { loadUser } from "./action/auth";
import setAuthToken from "./utils/setAuthToken";
import "./App.css";
import Dashboard from "./components/dashboard/Dashboard";
import CreateProfile from "./components/profile-forms/CreateProfile";
import EditProfile from "./components/profile-forms/EditProfile";
import PrivateRoutes from "./routing/PrivateRoutes";

if (localStorage.token) {
  setAuthToken(localStorage.token);
}

const App = () => {
  useEffect(() => {
    store.dispatch(loadUser());
  }, []);
  return (
    <Provider store={store}>
      <Router>
        <Fragment>
          <Navbar />
          <Route exact path='/' component={Landing} />
          <section className='container'>
            <Alert />
            <Switch>
              <Route exact path='/login' component={Login} />
              <Route exact path='/register' component={Register} />
              <PrivateRoutes exact path='/dashboard' component={Dashboard} />
              <PrivateRoutes
                exact
                path='/create-profile'
                component={CreateProfile}
              />
              <PrivateRoutes
                exact
                path='/edit-profile'
                component={EditProfile}
              />
            </Switch>
          </section>
        </Fragment>
      </Router>
    </Provider>
  );
};

export default App;
