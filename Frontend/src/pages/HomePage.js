// src/pages/HomePage.js
import React, { useState, useEffect } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { Routes } from "../routes";

import MainPage from "./MainPage";
import Second from "./Second"; 

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Preloader from "../components/Preloader";

const RouteWithSidebar = ({ component: Component, ...rest }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 300);
    return () => clearTimeout(t);
  }, []);

  const localStorageIsSettingsVisible = () =>
    localStorage.getItem("settingsVisible") !== "false";

  const [showSettings, setShowSettings] = useState(localStorageIsSettingsVisible);

  const toggleSettings = () => {
    const value = !showSettings;
    setShowSettings(value);
    localStorage.setItem("settingsVisible", value);
  };

  return (
    <Route
      {...rest}
      render={(props) => (
        <>
          <Preloader show={!loaded} />
          <Sidebar />

          <main className="content">
            <Navbar />
            <Component {...props} />
            <Footer
              toggleSettings={toggleSettings}
              showSettings={showSettings}
            />
          </main>
        </>
      )}
    />
  );
};

const HomePage = () => (
  <Switch>
    {/* главная (MVP) */}
    <RouteWithSidebar
      exact
      path={Routes.Main.path}
      component={MainPage}
    />

    {/* вторая страница */}
    <RouteWithSidebar
      exact
      path={Routes.Second.path}
      component={Second}
    />

    {/* всё остальное отправляем на главную */}
    <Redirect to={Routes.Main.path} />
  </Switch>
);

export default HomePage;
