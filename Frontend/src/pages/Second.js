// src/pages/Second.js
import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Form,
  ListGroup,
  Accordion,
  Spinner,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCheckCircle,
  faExclamationTriangle,
  faHighlighter,
  faCopy,
  faAlignLeft,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useLocation } from "react-router-dom";
import { Routes } from "../routes";

const API_BASE = "/api/v1";

const STYLE_PRESETS = {
  strict: {
    label: "Строгий официальный",
    description: "для регуляторов и госорганов",
  },
  corporate: {
    label: "Деловой корпоративный",
    description: "для партнёров и корпоративных клиентов",
  },
  client: {
    label: "Клиентоориентированный",
    description: "для клиентов и заявителей",
  },
  short: {
    label: "Краткий информационный",
    description: "для простых запросов и служебных записок",
  },
};

// маппинг API style → UI key
const API_STYLE_TO_KEY = {
  OFFICIAL_REGULATOR: "strict",
  CORPORATE: "corporate",
  CLIENT: "client",
  SHORT_INFO: "short",
};

const Second = () => {
  const { search } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);

  const letterId = params.get("letterId");
  const draftId = params.get("draftId");

  const [styleKey, setStyleKey] = useState("strict");
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState("");

  const [letterMeta, setLetterMeta] = useState(null);
  const [draftMeta, setDraftMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const currentStyle = STYLE_PRESETS[styleKey];

  // --- загрузка письма + черновика ---
  useEffect(() => {
    let intervalId;

    const fetchData = async () => {
      if (!draftId) {
        setError("Не передан идентификатор черновика (draftId).");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 1) тянем письмо (для бейджей сверху)
        if (letterId) {
          const letterRes = await fetch(`${API_BASE}/letters/${letterId}`);
          if (letterRes.ok) {
            const letter = await letterRes.json();
            setLetterMeta(letter);
          }
        }

        // 2) тянем черновик
        const loadDraft = async () => {
          const draftRes = await fetch(`${API_BASE}/drafts/${draftId}`);
          if (!draftRes.ok) {
            throw new Error(`Ошибка загрузки черновика: ${draftRes.status}`);
          }
          const draft = await draftRes.json();
          setDraftMeta(draft);

          // если текст уже готов – выставляем
          if (draft.text) {
            const key =
              API_STYLE_TO_KEY[draft.style] || "strict";
            setStyleKey(key);
            setText(draft.text);
          }

          return draft;
        };

        const firstDraft = await loadDraft();

        // если по спецификации статус "GENERATING" – поллим, пока не станет EDITABLE
        if (firstDraft.status === "GENERATING") {
          intervalId = setInterval(async () => {
            try {
              const d = await loadDraft();
              if (d.status !== "GENERATING") {
                clearInterval(intervalId);
                setLoading(false);
              }
            } catch (e) {
              // eslint-disable-next-line no-console
              console.error(e);
              clearInterval(intervalId);
              setError("Ошибка при обновлении статуса генерации.");
              setLoading(false);
            }
          }, 2000);
        } else {
          setLoading(false);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        setError("Не удалось загрузить черновик ответа. Проверьте подключение к серверу.");
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [letterId, draftId]);

  // смена стиля: пока оставим локально (без перегенерации на бэке),
  // но можно будет повесить POST /letters/{letterId}/drafts со style.
  const handleStyleChange = (key) => {
    setStyleKey(key);

    // если backend вернул текст — не трогаем его, пользователь просто меняет "лейбл".
    // если текста вдруг нет – можно подставить простой шаблон:
    if (!text) {
      setText(
        `Здесь будет текст в стиле: "${STYLE_PRESETS[key].label}".`
      );
    }
  };

  const handleCopy = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {
        // eslint-disable-next-line no-console
        console.log("Не удалось скопировать в буфер обмена.");
      });
    } else {
      // eslint-disable-next-line no-console
      console.log("Копирование текста ответа:\n", text);
    }
  };

  const recipientBadge = letterMeta?.sender
    ? `Адресат: ${letterMeta.sender}`
    : "Адресат: (не указано)";

  const slaBadge = letterMeta?.slaAt
    ? `SLA до: ${new Date(letterMeta.slaAt).toLocaleString()}`
    : "SLA: —";

  return (
    <article>
      <Container fluid className="px-3 px-md-4">
        {/* Заголовок + «назад» */}
        <Row className="d-flex flex-wrap flex-md-nowrap align-items-center py-4">
          <Col className="d-block mb-3 mb-md-0">
            <div className="d-flex align-items-center gap-3">
              <Button
                as={Link}
                to={Routes.Main.path}
                variant="outline-secondary"
                size="sm"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                К генерациям
              </Button>
              <div>
                <h1 className="h2 mb-1">Сгенерированный ответ</h1>
                <p className="mb-0 text-muted">
                  Черновик письма, подготовленный ИИ. Здесь можно сменить стиль,
                  отредактировать текст и скопировать его в почтовый клиент.
                </p>
              </div>
            </div>
          </Col>
        </Row>

        {/* Бейджи о письме */}
        <Row className="mb-3">
          <Col>
            <div className="d-flex flex-wrap gap-2">
              <Badge bg="primary">{recipientBadge}</Badge>
              <Badge bg="info" text="light">
                Тип: {draftMeta?.letterType || "Регуляторный запрос"}
              </Badge>
              <Badge bg="secondary">{slaBadge}</Badge>
              <Badge bg="warning" text="dark">
                <FontAwesomeIcon icon={faExclamationTriangle} className="me-1" />
                Требуется согласование
              </Badge>
            </div>
          </Col>
        </Row>

        {loading ? (
          <Row className="my-5">
            <Col className="text-center">
              <Spinner animation="border" role="status" className="mb-2" />
              <div className="text-muted">
                {draftMeta?.status === "GENERATING"
                  ? "ИИ готовит черновик ответа..."
                  : "Загружаем данные..."}
              </div>
            </Col>
          </Row>
        ) : (
          <>
            {error && (
              <Row className="mb-3">
                <Col>
                  <div className="text-danger small">{error}</div>
                </Col>
              </Row>
            )}

            <Row className="mb-4">
              {/* ЛЕВАЯ ПОЛОВИНА — текст письма */}
              <Col lg={8} className="mb-4 mb-lg-0">
                <Card className="shadow-sm h-100">
                  <Card.Header className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <div>
                      <Card.Title className="mb-0">
                        <FontAwesomeIcon icon={faAlignLeft} className="me-2" />
                        Текст ответа
                      </Card.Title>
                      <Card.Subtitle className="text-muted mt-1">
                        Стиль: {currentStyle.label} ({currentStyle.description})
                      </Card.Subtitle>
                    </div>

                    <div className="d-flex flex-wrap gap-2">
                      {/* выбор стиля */}
                      <Form.Select
                        size="sm"
                        value={styleKey}
                        onChange={(e) => handleStyleChange(e.target.value)}
                        style={{ minWidth: 230 }}
                        disabled={isRegenerating}
                      >
                        <option value="strict">Строгий официальный</option>
                        <option value="corporate">Деловой корпоративный</option>
                        <option value="client">Клиентоориентированный</option>
                        <option value="short">Краткий информационный</option>
                      </Form.Select>

                      <Button
                        size="sm"
                        variant={isEditing ? "success" : "outline-primary"}
                        onClick={() => setIsEditing((v) => !v)}
                      >
                        <FontAwesomeIcon icon={faHighlighter} className="me-2" />
                        {isEditing
                          ? "Закончить редактирование"
                          : "Редактировать"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={handleCopy}
                      >
                        <FontAwesomeIcon icon={faCopy} className="me-2" />
                        Скопировать
                      </Button>
                    </div>
                  </Card.Header>

                  <Card.Body>
                    {isEditing ? (
                      <Form.Control
                        as="textarea"
                        rows={14}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                      />
                    ) : (
                      <pre
                        className="mb-0"
                        style={{
                          whiteSpace: "pre-wrap",
                          fontFamily: "inherit",
                          lineHeight: 1.5,
                        }}
                      >
                        {text || "Текст черновика пока отсутствует."}
                      </pre>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              {/* ПРАВАЯ ПОЛОВИНА — пересказ, ключевые моменты, автоанализ, версии */}
              <Col lg={4}>
                {/* Краткий пересказ */}
                <Card className="shadow-sm mb-3">
                  <Card.Header>
                    <Card.Title className="mb-0 d-flex align-items-center">
                      <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                      Краткий пересказ
                    </Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <p className="mb-2 small text-muted">
                      Сжатое описание сути ответа — удобно показывать руководителям.
                    </p>
                    <ul className="mb-0 small">
                      <li>Подтверждаем получение запроса регулятора.</li>
                      <li>Сообщаем об анализе операций и отсутствии нарушений.</li>
                      <li>Прикладываем детальный отчёт и предлагаем доп. пояснения.</li>
                    </ul>
                  </Card.Body>
                </Card>

                {/* Подробности прячем в аккордеон, чтобы не захламлять UI */}
                <Accordion defaultActiveKey={null} className="mb-3">
                  <Accordion.Item eventKey="0">
                    <Accordion.Header>Ключевые моменты и риски</Accordion.Header>
                    <Accordion.Body>
                      <ListGroup variant="flush">
                        <ListGroup.Item className="px-0 d-flex gap-2">
                          <FontAwesomeIcon
                            icon={faExclamationTriangle}
                            className="mt-1 text-warning"
                          />
                          <span className="small">
                            Избегать формулировок о «полном отсутствии рисков» —
                            лучше «нарушений не выявлено».
                          </span>
                        </ListGroup.Item>
                        <ListGroup.Item className="px-0 d-flex gap-2">
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="mt-1 text-success"
                          />
                          <span className="small">
                            Подчеркнуть готовность быстро предоставить
                            дополнительные разъяснения.
                          </span>
                        </ListGroup.Item>
                        <ListGroup.Item className="px-0 d-flex gap-2">
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="mt-1 text-success"
                          />
                          <span className="small">
                            Зафиксировать ссылки на приложенные файлы во
                            внутренних системах.
                          </span>
                        </ListGroup.Item>
                      </ListGroup>
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="1">
                    <Accordion.Header>Автоанализ письма</Accordion.Header>
                    <Accordion.Body>
                      <ListGroup variant="flush" className="small">
                        <ListGroup.Item className="px-0 d-flex justify-content-between">
                          <span className="text-muted">Тип обращения</span>
                          <span className="fw-semibold text-end">
                            {draftMeta?.letterType || "Регуляторный запрос"}
                          </span>
                        </ListGroup.Item>
                        <ListGroup.Item className="px-0 d-flex justify-content-between">
                          <span className="text-muted">Рекомендуемый SLA</span>
                          <span className="fw-semibold">
                            {letterMeta?.slaAt
                              ? "24 часа"
                              : "—"}
                          </span>
                        </ListGroup.Item>
                        <ListGroup.Item className="px-0 d-flex justify-content-between">
                          <span className="text-muted">Уровень риска</span>
                          <Badge bg="danger" pill>
                            Высокий
                          </Badge>
                        </ListGroup.Item>
                        <ListGroup.Item className="px-0">
                          <div className="text-muted mb-1">
                            Рекомендуемые согласующие
                          </div>
                          <ul className="mb-0 ps-3">
                            <li>Юридический департамент</li>
                            <li>Комплаенс</li>
                            <li>Профильный бизнес-блок</li>
                          </ul>
                        </ListGroup.Item>
                      </ListGroup>
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="2">
                    <Accordion.Header>Версии ответа</Accordion.Header>
                    <Accordion.Body className="p-0">
                      <ListGroup variant="flush">
                        <ListGroup.Item className="d-flex justify-content-between align-items-center">
                          <div>
                            <div className="fw-semibold small">Черновик №1</div>
                            <div className="small text-muted">
                              {currentStyle.label} · версия{" "}
                              {draftMeta?.version ?? 1}
                            </div>
                          </div>
                          <Badge bg="secondary" pill>
                            Текущий
                          </Badge>
                        </ListGroup.Item>
                      </ListGroup>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </article>
  );
};

export default Second;
