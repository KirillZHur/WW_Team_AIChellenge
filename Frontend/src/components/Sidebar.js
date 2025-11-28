// src/components/Sidebar.js
import React, { useState } from "react";
import SimpleBar from "simplebar-react";
import { useLocation, Link } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartPie, faSitemap, faSignOutAlt, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Nav, Image, Button, Navbar } from "@themesberg/react-bootstrap";

import { Routes } from "../routes";
import ReactHero from "../assets/img/technologies/react-hero-logo.svg";
import ProfilePicture from "../assets/img/team/profile-picture-3.jpg";

export default function Sidebar() {
  const location = useLocation();
  const { pathname } = location;
  const [show, setShow] = useState(false);
  const showClass = show ? "show" : "";

  const onCollapse = () => setShow(!show);

  const NavItem = ({ title, link, icon, image }) => {
    const navItemClassName = link === pathname ? "active" : "";
    const linkProps = { as: Link, to: link };

    return (
      <Nav.Item className={navItemClassName} onClick={() => setShow(false)}>
        <Nav.Link {...linkProps}>
          <span>
            {icon && (
              <span className="sidebar-icon">
                <FontAwesomeIcon icon={icon} />{" "}
              </span>
            )}
            {image && (
              <Image
                src={image}
                width={20}
                height={20}
                className="sidebar-icon svg-icon"
              />
            )}
            <span className="sidebar-text">{title}</span>
          </span>
        </Nav.Link>
      </Nav.Item>
    );
  };

  return (
    <>
      {/* мобильный топ-бар для открытия сайдбара */}
      <Navbar
        expand={false}
        collapseOnSelect
        variant="dark"
        className="navbar-theme-primary px-4 d-md-none"
      >
        <Navbar.Brand className="me-lg-5" as={Link} to={Routes.Main.path}>
          <Image src={ReactHero} className="navbar-brand-light" />
        </Navbar.Brand>
        <Navbar.Toggle
          as={Button}
          aria-controls="main-navbar"
          onClick={onCollapse}
        >
          <span className="navbar-toggler-icon" />
        </Navbar.Toggle>
      </Navbar>

      <CSSTransition timeout={300} in={show} classNames="sidebar-transition">
        <SimpleBar
          className={`collapse ${showClass} sidebar d-md-block bg-primary text-white`}
        >
          <div className="sidebar-inner px-4 pt-3">
            {/* карточка пользователя на мобиле */}
            <div className="user-card d-flex d-md-none align-items-center justify-content-between justify-content-md-center pb-4">
              <div className="d-flex align-items-center">
                <div className="user-avatar lg-avatar me-4">
                  <Image
                    src={ProfilePicture}
                    className="card-img-top rounded-circle border-white"
                  />
                </div>
                <div className="d-block">
                  <h6>Привет, Иван</h6>
                  {/* пока просто ведём на главную */}
                  <Button
                    as={Link}
                    variant="secondary"
                    size="xs"
                    to={Routes.Main.path}
                    className="text-dark"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="me-2" /> Выйти
                  </Button>
                </div>
              </div>
              <Nav.Link className="collapse-close d-md-none" onClick={onCollapse}>
                <FontAwesomeIcon icon={faTimes} />
              </Nav.Link>
            </div>

            {/* основное меню */}
            <Nav className="flex-column pt-3 pt-md-0">
              {/* логотип / домик */}
              <NavItem
                title="Главная"
                link={Routes.Main.path}
                image={ReactHero}
              />

              <NavItem
                title="Аналитика / загрузка"
                link={Routes.Main.path}
                icon={faChartPie}
              />

              <NavItem
                title="Ответ"
                link={Routes.Second.path}
                icon={faSitemap}
              />
            </Nav>
          </div>
        </SimpleBar>
      </CSSTransition>
    </>
  );
}
