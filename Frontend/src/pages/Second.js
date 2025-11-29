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
import api from "../api";

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

// маппинг DraftStyle из API → UI key
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
  const initialDraftId = params.get("draftId");

  const [styleKey, setStyleKey] = useState("strict");
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState("");

  const [letterMeta, setLetterMeta] = useState(null); // из GET /letters/{id}
  const [drafts, setDrafts] = useState([]); // список DraftSummaryDto
  const [currentDraftId, setCurrentDraftId] = useState(null);

  // GetDraftsResponse-метаданные
  const [letterTitle, setLetterTitle] = useState("");
  const [letterType, setLetterType] = useState(null);
  const [quickly, setQuickly] = useState(false);
  const [summary, setSummary] = useState(null);
  const [approvers, setApprovers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const currentStyle = STYLE_PRESETS[styleKey];
  const currentDraft = drafts.find((d) => d.id === currentDraftId) || null;

  // --- загрузка письма + списка черновиков ---
  useEffect(() => {
    if (!letterId) {
      setError("Не передан идентификатор письма (letterId).");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1) метаданные письма (для SLA, адресата и т.п., если бэк это поддерживает)
        try {
          const letterRes = await api.get(`/letters/${letterId}`);
          if (!cancelled) {
            setLetterMeta(letterRes.data);
          }
        } catch (e) {
          // опционально: бэк может не иметь этой ручки — тогда тихо пропускаем
          // eslint-disable-next-line no-console
          console.warn("Не удалось получить метаданные письма", e);
        }

        // 2) список черновиков + аналитика
        const draftsRes = await api.get(`/letters/${letterId}/drafts`);
        if (cancelled) return;

        const data = draftsRes.data;
        setDrafts(data.drafts || []);
        setLetterTitle(data.title || "");
        setLetterType(data.type || null);
        setQuickly(Boolean(data.quickly));
        setSummary(data.summary || null);
        setApprovers(data.approvers || []);

        if (!data.drafts || data.drafts.length === 0) {
          setError("По данному письму пока нет черновиков ответа.");
          setLoading(false);
          return;
        }

        // выбираем текущий черновик:
        // 1) если в URL указан draftId — используем его;
        // 2) иначе берём первый в списке
        let chosenDraft =
          data.drafts.find((d) => String(d.id) === String(initialDraftId)) ||
          data.drafts[0];

        setCurrentDraftId(chosenDraft.id);
        setText(chosenDraft.text || "");

        const mappedStyle =
          API_STYLE_TO_KEY[chosenDraft.style] || "strict";
        setStyleKey(mappedStyle);

        setLoading(false);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        if (!cancelled) {
          setError(
            "Не удалось загрузить черновики по письму. Проверьте подключение к серверу."
          );
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [letterId, initialDraftId]);

  // смена стиля — только на уровне UI (текст не перегенерируем)
  const handleStyleChange = (key) => {
    setStyleKey(key);
    // текст берём текущий, не меняем
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

  const handleToggleEdit = async () => {
    // если выходим из режима редактирования — отправляем PUT /drafts/{id}
    if (isEditing) {
      if (!currentDraftId) {
        setIsEditing(false);
        return;
      }

      setSaving(true);
      setError(null);

      try {
        await api.put(`/drafts/${currentDraftId}`, {
          text,
        });

        // локально обновляем выбранный драфт
        setDrafts((prev) =>
          prev.map((d) =>
            d.id === currentDraftId ? { ...d, text } : d
          )
        );
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        setError("Не удалось сохранить изменения черновика.");
      } finally {
        setSaving(false);
        setIsEditing(false);
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleSelectDraft = (id) => {
    const draft = drafts.find((d) => d.id === id);
    if (!draft) return;

    setCurrentDraftId(draft.id);
    setText(draft.text || "");
    const mappedStyle = API_STYLE_TO_KEY[draft.style] || "strict";
    setStyleKey(mappedStyle);
    setIsEditing(false);
  };

  const recipientBadge = letterMeta?.sender
    ? `Адресат: ${letterMeta.sender}`
    : "Адресат: (не указано)";

  const slaBadge = letterMeta?.slaAt
    ? `SLA до: ${new Date(letterMeta.slaAt).toLocaleString()}`
    : "SLA: —";

  const riskLabel = quickly ? "Высокий" : "Средний";
  const riskBadgeVariant = quickly ? "danger" : "warning";

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
              <Badge bg="primary">
                {letterTitle ? `Письмо: ${letterTitle}` : "Письмо"}
              </Badge>
              <Badge bg="primary">{recipientBadge}</Badge>
              <Badge bg="info" text="light">
                Тип: {letterType || "Не указан"}
              </Badge>
              <Badge bg="secondary">{slaBadge}</Badge>
              <Badge bg={riskBadgeVariant} text="light">
                <FontAwesomeIcon icon={faExclamationTriangle} className="me-1" />
                Уровень риска: {riskLabel}
              </Badge>
            </div>
          </Col>
        </Row>

        {loading ? (
          <Row className="my-5">
            <Col className="text-center">
              <Spinner animation="border" role="status" className="mb-2" />
              <div className="text-muted">Загружаем данные...</div>
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
                      {/* выбор стиля (пока только UI) */}
                      <Form.Select
                        size="sm"
                        value={styleKey}
                        onChange={(e) => handleStyleChange(e.target.value)}
                        style={{ minWidth: 230 }}
                        disabled={saving}
                      >
                        <option value="strict">Строгий официальный</option>
                        <option value="corporate">Деловой корпоративный</option>
                        <option value="client">Клиентоориентированный</option>
                        <option value="short">Краткий информационный</option>
                      </Form.Select>

                      <Button
                        size="sm"
                        variant={isEditing ? "success" : "outline-primary"}
                        onClick={handleToggleEdit}
                        disabled={saving || !currentDraftId}
                      >
                        <FontAwesomeIcon icon={faHighlighter} className="me-2" />
                        {isEditing
                          ? saving
                            ? "Сохраняем..."
                            : "Закончить редактирование"
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
                    {summary ? (
                      <p className="mb-0 small">{summary}</p>
                    ) : (
                      <>
                        <p className="mb-2 small text-muted">
                          Сжатое описание сути ответа — удобно показывать
                          руководителям.
                        </p>
                        <p className="mb-0 small text-muted">
                          Пересказ пока не предоставлен бэкендом.
                        </p>
                      </>
                    )}
                  </Card.Body>
                </Card>

                {/* Подробности прячем в аккордеон */}
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
                            Уровень риска: {riskLabel}. Для регуляторных запросов
                            рекомендуется аккуратная формулировка выводов и
                            ссылки на нормативную базу.
                          </span>
                        </ListGroup.Item>
                        <ListGroup.Item className="px-0 d-flex gap-2">
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="mt-1 text-success"
                          />
                          <span className="small">
                            Подчеркните готовность предоставить дополнительные
                            разъяснения и документы по запросу контрагента.
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
                            {letterType || "Не указан"}
                          </span>
                        </ListGroup.Item>
                        <ListGroup.Item className="px-0 d-flex justify-content-between">
                          <span className="text-muted">Срочность</span>
                          <span className="fw-semibold">
                            {quickly ? "Требует быстрого ответа" : "Обычная"}
                          </span>
                        </ListGroup.Item>
                        <ListGroup.Item className="px-0 d-flex justify-content-between align-items-center">
                          <span className="text-muted">Уровень риска</span>
                          <Badge bg={riskBadgeVariant} pill>
                            {riskLabel}
                          </Badge>
                        </ListGroup.Item>
                        <ListGroup.Item className="px-0">
                          <div className="text-muted mb-1">
                            Рекомендуемые согласующие
                          </div>
                          {approvers && approvers.length > 0 ? (
                            <ul className="mb-0 ps-3">
                              {approvers.map((a, idx) => (
                                <li key={idx}>{a}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="small text-muted">
                              Согласующие не указаны.
                            </span>
                          )}
                        </ListGroup.Item>
                      </ListGroup>
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="2">
                    <Accordion.Header>Версии ответа</Accordion.Header>
                    <Accordion.Body className="p-0">
                      <ListGroup variant="flush">
                        {drafts.map((d) => (
                          <ListGroup.Item
                            key={d.id}
                            className="d-flex justify-content-between align-items-center"
                          >
                            <div>
                              <div className="fw-semibold small">
                                Черновик #{d.id}
                              </div>
                              <div className="small text-muted">
                                Стиль: {d.style}
                              </div>
                            </div>
                            {d.id === currentDraftId ? (
                              <Badge bg="secondary" pill>
                                Текущий
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() => handleSelectDraft(d.id)}
                              >
                                Открыть
                              </Button>
                            )}
                          </ListGroup.Item>
                        ))}
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
