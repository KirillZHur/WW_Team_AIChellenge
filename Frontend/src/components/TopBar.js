// src/components/TopBar.js
import React, { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Navbar,
  Container,
  Nav,
  Dropdown,
  Image,
  Badge,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartPie,
  faSitemap,
  faBell,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { faUserCircle } from "@fortawesome/free-regular-svg-icons";

import { Routes } from "../routes";
import Profile3 from "../assets/img/team/profile-picture-1.jpg";
import ReactHero from "../assets/img/technologies/react-hero-logo.svg";
import NOTIFICATIONS_DATA from "../data/notifications";

export default function TopBar() {
  const { pathname } = useLocation();
  const [notifications, setNotifications] = useState(NOTIFICATIONS_DATA);
  const unread = notifications.filter((n) => !n.read).length;

  const markAsRead = () => {
    if (!unread) return;
    setTimeout(
      () => setNotifications((n) => n.map((x) => ({ ...x, read: true }))),
      150
    );
  };

  const LeftNav = () => (
    <>
      {/* Главная (MainPage) */}
      <Nav.Link
        as={NavLink}
        exact
        to={Routes.Main.path}
        activeClassName="active"
      >
        <FontAwesomeIcon icon={faChartPie} className="me-2" />
        Главная
      </Nav.Link>

      {/* Вторая страница (Second) */}
      <Nav.Link
        as={NavLink}
        exact
        to={Routes.Second.path}
        activeClassName="active"
      >
        <FontAwesomeIcon icon={faSitemap} className="me-2" />
        Дерево изделия
      </Nav.Link>
    </>
  );

  const RightNav = () => (
    <Nav className="ms-auto align-items-center right-gap">
      <Dropdown as={Nav.Item} onToggle={markAsRead}>
        <Dropdown.Toggle
          as={Nav.Link}
          className="text-white position-relative p-0"
        >
          <FontAwesomeIcon icon={faBell} />
          {unread > 0 && (
            <Badge
              bg="danger"
              pill
              className="position-absolute top-0 start-100 translate-middle"
            >
              {unread}
            </Badge>
          )}
        </Dropdown.Toggle>
        <Dropdown.Menu align="end" className="mt-2">
          <Dropdown.Header>Уведомления</Dropdown.Header>
          {notifications.map((n) => (
            <Dropdown.Item key={`notification-${n.id}`}>
              <div className="small fw-semibold">{n.sender}</div>
              <div className="small text-muted">{n.message}</div>
            </Dropdown.Item>
          ))}
          {!notifications.length && (
            <Dropdown.Item className="text-muted">Пусто</Dropdown.Item>
          )}
        </Dropdown.Menu>
      </Dropdown>

      <Dropdown as={Nav.Item}>
        <Dropdown.Toggle as={Nav.Link} className="pt-1 px-0 text-white">
          <span className="d-inline-flex align-items-center">
            <Image
              src={Profile3}
              className="user-avatar md-avatar rounded-circle me-2"
            />
            <span className="d-none d-lg-inline fw-semibold">
              Иванов Иван
            </span>
          </span>
        </Dropdown.Toggle>
        <Dropdown.Menu align="end" className="mt-2">
          <Dropdown.Item>
            <FontAwesomeIcon icon={faUserCircle} className="me-2" /> Мой профиль
          </Dropdown.Item>
          <Dropdown.Item>
            <FontAwesomeIcon icon={faSignOutAlt} className="me-2" /> Выйти
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </Nav>
  );

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="topbar full-bleed">
      <Container fluid className="px-3">
        {/* логотип / бренд */}
        <Navbar.Brand
          as={Link}
          to={Routes.Main.path}
          className="d-flex align-items-center gap-2"
        >
          <Image src={ReactHero} height={22} alt="logo" className="opacity-100" />
          <span className="fw-semibold">ZARЯ</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="topbar-collapse" />

        <Navbar.Collapse id="topbar-collapse" className="d-flex w-100">
          <Nav className="left-nav ms-3">
            <LeftNav />
          </Nav>
          <RightNav />
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
