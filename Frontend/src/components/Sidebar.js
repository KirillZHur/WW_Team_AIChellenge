import React, { useEffect, useState } from "react";
import SimpleBar from "simplebar-react";
import { useLocation, Link } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faChartPie,
  faSignOutAlt,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { Nav, Image, Button, Navbar } from "@themesberg/react-bootstrap";

import { Routes } from "../routes";
import LogoPsb from "../assets/img/logo-psb.png"; // прозрачный логотип

import ProfilePicture from "../assets/img/team/profile-picture-3.jpg";
import api from "../api";

export default function Sidebar() {
  const location = useLocation();
  const { pathname } = location;
  const [show, setShow] = useState(false);
  const showClass = show ? "show" : "";

  const [threads, setThreads] = useState([]); // история писем { id, title }

  const onCollapse = () => setShow(!show);

  // История писем (обновляется при переходах)
  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      try {
        const res = await api.get("/letters");
        if (!cancelled) setThreads(res.data || []);
      } catch (e) {
        console.error("Не удалось загрузить историю писем", e);
      }
    };

    loadHistory();

    return () => (cancelled = true);
  }, [pathname]);

  const NavItem = ({ title, link, icon, image }) => {
    const navItemClassName = link === pathname ? "active" : "";
    const linkProps = { as: Link, to: link };

    return (
      <Nav.Item className={navItemClassName} onClick={() => setShow(false)}>
        <Nav.Link {...linkProps} title={title}>
          <span className="d-flex align-items-center">
            {icon && (
              <span className="sidebar-icon">
                <FontAwesomeIcon icon={icon} />
              </span>
            )}
            {image && (
              <Image
                src={image}
                width={22}
                height={22}
                className="sidebar-icon svg-icon"
              />
            )}
            <span className="sidebar-text-ellipsis">{title}</span>
          </span>
        </Nav.Link>
      </Nav.Item>
    );
  };

  return (
    <>
      {/* мобильный топ-бар */}
      <Navbar
        expand={false}
        collapseOnSelect
        variant="dark"
        className="navbar-theme-primary px-4 d-md-none"
      >
        <Navbar.Brand className="me-lg-5">
          <Image src={LogoPsb} width={34} alt="PSB logo" />
        </Navbar.Brand>
        <Navbar.Toggle as={Button} onClick={onCollapse}>
          <span className="navbar-toggler-icon" />
        </Navbar.Toggle>
      </Navbar>

      <CSSTransition timeout={300} in={show} classNames="sidebar-transition">
        <SimpleBar
          className={`collapse ${showClass} sidebar d-md-block bg-primary text-white`}
        >
          <div className="sidebar-inner px-4 pt-3">

            {/* ЛОГОТИП – добавлен сверху */}
            <div className="d-flex justify-content-center mb-4 mt-2">
              <Image
                src={LogoPsb}
                width={70}
                alt="PSB logo"
                style={{ pointerEvents: "none" }} // не кнопка
              />
            </div>

            {/* карточка пользователя на мобиле */}
            <div className="user-card d-flex d-md-none align-items-center justify-content-between pb-4">
              <div className="d-flex align-items-center">
                <div className="user-avatar lg-avatar me-4">
                  <Image
                    src={ProfilePicture}
                    className="card-img-top rounded-circle border-white"
                  />
                </div>
                <div className="d-block">
                  <h6>Привет, Иван</h6>
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
              {/* Новое письмо — теперь с иконкой конверта */}
              <NavItem
                title="Новое письмо"
                link={Routes.Main.path}
                icon={faEnvelope}
              />

              <NavItem
                title="Последний ответ"
                link={Routes.Second.path}
                icon={faChartPie}
              />

              {/* История */}
              <div className="mt-4">
                <div className="small text-uppercase text-white-50 mb-2">
                  Ответы
                </div>

                {threads.map((t) => (
                  <NavItem
                    key={t.id}
                    title={t.title || `Письмо #${t.id}`}
                    link={`${Routes.Second.path}?letterId=${t.id}`}
                  />
                ))}
              </div>
            </Nav>
          </div>
        </SimpleBar>
      </CSSTransition>
    </>
  );
}
