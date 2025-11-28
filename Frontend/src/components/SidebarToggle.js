
import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import SimpleBar from 'simplebar-react';
import { useLocation } from "react-router-dom";
import { CSSTransition } from 'react-transition-group';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faBoxOpen, faChartPie, faCog, faFileAlt, faHandHoldingUsd, faSignOutAlt, faTable, faTimes, faCalendarAlt, faMapPin, faInbox, faRocket } from "@fortawesome/free-solid-svg-icons";
import { Nav, Badge, Image, Button, Dropdown, Accordion, Navbar } from '@themesberg/react-bootstrap';
import { Link } from 'react-router-dom';

import ThemesbergLogo from "../assets/img/themesberg.svg";
import ReactHero from "../assets/img/technologies/react-hero-logo.svg";
import ProfilePicture from "../assets/img/team/profile-picture-3.jpg";

const MIN_WIDTH     = 180; // px
const MAX_WIDTH     = 600; // px
const DEFAULT_WIDTH = 260; // px

export default function SidebarToggle({ isOpen, onClose, sentinel, children }) {
  const sidebarRef  = useRef(null);
  const resizerRef  = useRef(null);
  const [width,  setWidth]  = useState(DEFAULT_WIDTH);
  const [affixed, setAffix] = useState(false);      // «прилипли» к top:0

  /* --- Escape закрывает -------------------------------------------------- */
  useEffect(() => {
    const onKey = e => e.key === "Escape" && isOpen && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  /* --- Drag-resize ------------------------------------------------------- */
  useEffect(() => {
    const resizer = resizerRef.current;
    if (!resizer) return;

    const onDown = e => {
      const startX     = e.clientX;
      const startWidth = sidebarRef.current.offsetWidth;

      const onMove = ev => {
        const w = Math.min(
          MAX_WIDTH,
          Math.max(MIN_WIDTH, startWidth + ev.clientX - startX)
        );
        setWidth(w);
      };

      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup",   onUp);
        document.body.style.userSelect = "";
        document.body.style.cursor     = "";
      };

      document.body.style.userSelect = "none";
      document.body.style.cursor     = "col-resize";
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup",   onUp);
    };

    resizer.addEventListener("mousedown", onDown);
    return () => resizer.removeEventListener("mousedown", onDown);
  }, []);

  /* --- sticky → fixed, когда <hr> пропал -------------------------------- */
  // useEffect(() => {
  //   if (!sentinel?.current) return;
  //   const sidebar = sidebarRef.current;
  //   const wrapper = sidebar.parentElement;

  //   if (!ghostRef.current) {
  //       const g = document.createElement("div");
  //       g.style.flex = "0 0 auto";
  //       g.style.pointerEvents = "none";
  //       ghostRef.current = g;
  //   }


  //   const lockLeft = () => {
  //     const { left } = sidebar.getBoundingClientRect();
  //     sidebar.style.left = `${left}px`;
  //     ghostRef.current.style.width = `${sidebar.offsetWidth}px`;
  //     if (!ghostRef.current.parentNode) {
  //       wrapper.insertBefore(ghostRef.current, sidebar);
  //     }
  //   };

  //   const unlockLeft = () => {
  //       sidebar.style.left = "";
  //       if (ghostRef.current.parentNode) {
  //           ghostRef.current.parentNode.removeChild(ghostRef.current);
  //       }
  //   };

  //   const observer = new IntersectionObserver(
  //     ([entry]) => {
  //       if (entry.isIntersecting) {     // <hr> ещё видно
  //         sidebar.classList.remove("affixed");
  //         unlockLeft();
  //         setAffix(false);
  //       } else {                        // <hr> ушёл вверх
  //         lockLeft();
  //         sidebar.classList.add("affixed");
  //         setAffix(true);
  //       }
  //     },
  //     { threshold: 0, rootMargin: "-1px 0px 0px 0px" }
  //   );

  //   observer.observe(sentinel.current);

  //   const onResize = () => affixed && lockLeft();
  //   window.addEventListener("resize", onResize);

  //   return () => {
  //     observer.disconnect();
  //     window.removeEventListener("resize", onResize);
  //   };
  // }, [sentinel, affixed]);

  /* --- классы + рендер --------------------------------------------------- */
  const cls = `sub-sidebar${isOpen ? " open" : ""}${affixed ? " affixed" : ""}`;

  return (
    <aside ref={sidebarRef} className={cls} style={{ width }}>
      {/* тонкая «ручка» для ресайза */}
      <span ref={resizerRef} className="sub-sidebar__resizer" />

      {/* прокручиваемая область */}
      <div className="sub-sidebar__scroll">
        {children}
      </div>
    </aside>
  );
}

SidebarToggle.propTypes = {
  isOpen:   PropTypes.bool.isRequired,
  onClose:  PropTypes.func.isRequired,
  sentinel: PropTypes.object,  // React ref на <hr>
  children: PropTypes.node,
};