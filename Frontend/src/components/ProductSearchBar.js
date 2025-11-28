import { useEffect, useMemo, useRef, useState } from "react";
import { Form, InputGroup, Button, Card, ListGroup, Spinner } from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import api from "../api";

/**
 * Поисковая строка с подсказками.
 *
 * Новое:
 *  - управляемое значение: props.query + props.onQueryChange
 *    если query !== undefined, компонент работает в "controlled"-режиме.
 */
export default function ProductSearchBar({
  onSelect,
  // внешний контроль значения
  query,                // string | undefined
  onQueryChange,        // (string) => void | undefined

  placeholder = "Поиск по изделиям…",
  minLength = 2,
  limit = 15,
  className = "",
  dropdownClassName = "",
  size = "lg",
  fullWidth = true,
  showClear = true,
  dropdownZIndex = 2000,
}) {
  const isControlled = query !== undefined;
  const [qInner, setQInner] = useState(query ?? "");
  const q = isControlled ? query : qInner;

  const setQ = (val) => (isControlled ? onQueryChange?.(val) : setQInner(val));

  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(-1);

  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const reqRef = useRef(null);
  const cacheRef = useRef(new Map());

  // если из вне пришёл новый query — синхронизируем локальный стейт
  useEffect(() => {
    if (isControlled) setQInner(query ?? "");
  }, [isControlled, query]);

  const debouncedQ = useDebounce(q, 300);

  const rankedItems = useMemo(() => {
    const s = (debouncedQ || "").trim().toLowerCase();
    if (!s) return [];
    return items
      .map(p => {
        const name = (p.name ?? "").toLowerCase();
        const pos = name.indexOf(s);
        return { ...p, __pos: pos < 0 ? Number.MAX_SAFE_INTEGER : pos };
      })
      .filter(p => p.__pos !== Number.MAX_SAFE_INTEGER)
      .sort((a, b) => (a.__pos - b.__pos) || a.name.localeCompare(b.name));
  }, [items, debouncedQ]);

  // запрос + кэш
  useEffect(() => {
    const term = (debouncedQ || "").trim();
    if (term.length < minLength) {
      setItems([]); setErr(null); setOpen(false);
      return;
    }

    const key = `${term}|${limit}`;
    if (cacheRef.current.has(key)) {
      setItems(cacheRef.current.get(key));
      if (focused) setOpen(true);
      setErr(null);
      return;
    }

    if (reqRef.current) reqRef.current.abort();
    const ctrl = new AbortController();
    reqRef.current = ctrl;

    setLoading(true); setErr(null);
    api.get("/tree-product/search", { params: { pattern: term, limit }, signal: ctrl.signal })
      .then(({ data }) => {
        const arr = Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [];
        cacheRef.current.set(key, arr);
        setItems(arr);
        if (focused) setOpen(true);
      })
      .catch(e => {
        if (e.name === "CanceledError" || e.code === "ERR_CANCELED") return;
        setErr("Ошибка загрузки");
        if (focused) setOpen(true);
      })
      .finally(() => setLoading(false));

    return () => ctrl.abort();
  }, [debouncedQ, minLength, limit, focused]);

  // закрытие по клику вне
  useEffect(() => {
    const onDoc = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) {
        setFocused(false);
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc, true);
    return () => document.removeEventListener("mousedown", onDoc, true);
  }, []);

  const handlePick = (item) => {
    setQ(item?.name ?? "");
    setOpen(false);
    setActive(-1);
    onSelect?.(item);
  };

  const clear = () => {
    setQ("");
    setItems([]);
    setErr(null);
    setActive(-1);
    setOpen(false);
    inputRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(i => Math.min(i + 1, rankedItems.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(i => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && active >= 0 && rankedItems[active]) { e.preventDefault(); handlePick(rankedItems[active]); }
    else if (e.key === "Escape") { setOpen(false); inputRef.current?.blur(); }
  };

  const onBlurDelayed = () => setTimeout(() => {
    if (!rootRef.current?.contains(document.activeElement)) {
      setFocused(false);
      setOpen(false);
    }
  }, 120);

  // единая оболочка для ровного бордера/фокуса
  const shellStyle = {
    border: "1px solid var(--bs-border-color)",
    borderRadius: ".75rem",
    background: "#fff",
    boxShadow: focused ? "0 0 0 .25rem rgba(var(--bs-primary-rgb), .25)" : "none",
    transition: "box-shadow .15s ease, border-color .15s ease"
  };

  return (
    <div
      ref={rootRef}
      className={`position-relative ${className}`}
      style={{ width: fullWidth ? "100%" : undefined, maxWidth: fullWidth ? "100%" : 520 }}
    >
      <Form onSubmit={(e) => e.preventDefault()}>
        <Form.Group>
          <div className="psb-shell" style={shellStyle}>
            <InputGroup size={size} className="flex-nowrap">
              <InputGroup.Text style={{ border: 0, background: "transparent" }}>
                {loading ? <Spinner animation="border" size="sm" /> : <FontAwesomeIcon icon={faSearch} />}
              </InputGroup.Text>

              <Form.Control
                ref={inputRef}
                value={q}
                type="search"
                placeholder={placeholder}
                onChange={(e) => { setQ(e.target.value); if (focused) setOpen(true); }}
                onKeyDown={onKeyDown}
                onFocus={() => { setFocused(true); if (rankedItems.length) setOpen(true); }}
                onBlur={onBlurDelayed}
                autoComplete="off"
                style={{ border: 0, boxShadow: "none" }}
              />

              {showClear && q && (
                <Button
                  variant="link"
                  className="text-muted px-3"
                  onClick={clear}
                  tabIndex={-1}
                  style={{ border: 0 }}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </Button>
              )}
            </InputGroup>
          </div>
        </Form.Group>
      </Form>

      {open && (
        <Card
          className={`shadow position-absolute w-100 mt-2 ${dropdownClassName}`}
          style={{ zIndex: dropdownZIndex }}
        >
          {err && <Card.Body className="text-danger py-2">{err}</Card.Body>}

          {!err && rankedItems.length === 0 && (
            <Card.Body className="text-muted py-2">
              {(q || "").trim().length < minLength
                ? `Введите ещё ${minLength - (q || "").trim().length} символ(а)`
                : "Ничего не найдено"}
            </Card.Body>
          )}

          {!err && rankedItems.length > 0 && (
            <ListGroup variant="flush" style={{ maxHeight: 360, overflowY: "auto" }}>
              {rankedItems.map((p, idx) => (
                <ListGroup.Item
                  key={p.id ?? `${p.name}-${idx}`}
                  action
                  active={idx === active}
                  onMouseEnter={() => setActive(idx)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handlePick(p)}
                  className="d-flex justify-content-between align-items-center"
                >
                  <span dangerouslySetInnerHTML={{ __html: highlight(p.name, debouncedQ) }} />
                  {p.versionCreatedAt && (
                    <small className="text-muted ms-3">{formatExplorer(p.versionCreatedAt)}</small>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card>
      )}
    </div>
  );
}

/* helpers */
function useDebounce(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return v;
}
function escapeHtml(s = "") { return s.replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c])); }
function highlight(text="", query="") {
  const t = escapeHtml(text), q = escapeHtml((query || "").trim());
  if (!q) return t;
  const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  const m = t.match(re); if (!m) return t; const i = m.index;
  return t.slice(0,i)+"<mark>"+t.slice(i,i+m[0].length)+"</mark>"+t.slice(i+m[0].length);
}
function formatExplorer(iso) {
  if (!iso) return "";
  const safe = String(iso).replace(/\.(\d{3})\d*Z$/, ".$1Z").replace(/\.(\d{1,2})Z$/, ".$1Z");
  const d = new Date(safe); if (isNaN(d)) return "";
  const pad = n => String(n).padStart(2,"0");
  return `${pad(d.getDate())}.${pad(d.getMonth()+1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
