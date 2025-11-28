// src/pages/MainPage.js
import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Badge,
  ListGroup,
  InputGroup,
  Table,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faFileAlt,
  faPlay,
  faBroom,
  faClock,
  faBolt,
  faExclamationTriangle,
  faCheckCircle,
  faShieldAlt,
  faSitemap,
  faBuilding,
  faUserTie,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";

const STYLE_OPTIONS = [
  {
    id: "strict",
    title: "Строгий официальный",
    desc: "Для регуляторов и госорганов",
  },
  {
    id: "corporate",
    title: "Деловой корпоративный",
    desc: "Для партнёров и корпоративных клиентов",
  },
  {
    id: "client",
    title: "Клиентоориентированный",
    desc: "Для клиентов и заявителей",
  },
  {
    id: "short",
    title: "Краткий информационный",
    desc: "Для служебных записок и простых запросов",
  },
];

const MainPage = () => {
  // выбранный файл письма
  const [fileName, setFileName] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // «результат анализа» (пока мок)
  const [analysis] = useState({
    type: "Регуляторный запрос",
    slaHours: 24,
    tone: "Строгий официальный",
    risk: "high",
    approvers: ["Юридический департамент", "Комплаенс", "Профильный бизнес-блок"],
  });

  // выбранный стиль ответа ИИ
  const [selectedStyle, setSelectedStyle] = useState("strict");

  // варианты ответов (пока можно оставить как «шаг 2»)
  const [replyVariants] = useState([
    {
      id: 1,
      label: "Официальный ответ для регулятора",
      tone: "Строгий официальный стиль",
      size: "Развёрнутый",
    },
    {
      id: 2,
      label: "Сжатый ответ по сути запроса",
      tone: "Краткий деловой стиль",
      size: "Краткий",
    },
    {
      id: 3,
      label: "Черновик для доработки юристом",
      tone: "Нейтральный, без жёстких формулировок",
      size: "Черновик",
    },
  ]);

  // «маршрут согласования» (мок)
  const [route] = useState([
    { id: 1, unit: "Юридический департамент", sla: "4 ч", status: "waiting" },
    { id: 2, unit: "Комплаенс", sla: "4 ч", status: "waiting" },
    { id: 3, unit: "Профильный бизнес-блок", sla: "8 ч", status: "waiting" },
  ]);

  // журнал действий
  const [log, setLog] = useState([
    { id: 1, text: "Открыта главная страница обработки писем", ts: new Date() },
  ]);

  const addLog = (text) => {
    setLog((prev) => [
      { id: prev.length + 1, text, ts: new Date() },
      ...prev,
    ]);
  };

  const applyFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    addLog(`Загружен файл письма: ${file.name}`);
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    applyFile(file);
  };

  // drag & drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    applyFile(file);
  };

  const handleClear = () => {
    setFileName(null);
    addLog("Сброшены данные по текущему письму");
  };

  const handleAnalyze = () => {
    if (!fileName) {
      addLog("Попытка анализа без выбранного файла");
      return;
    }
    addLog(
      `Запущен автоанализ письма (мок, без API). Рекомендованный стиль: "${selectedStyle}".`
    );
  };

  const handleUseVariant = (v) => {
    addLog(`Выбран вариант ответа: "${v.label}"`);
  };

  const renderRisk = (risk) => {
    if (risk === "high") {
      return (
        <Badge bg="danger" pill>
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-1" />
          Высокий риск
        </Badge>
      );
    }
    if (risk === "medium") {
      return (
        <Badge bg="warning" text="dark" pill>
          Средний риск
        </Badge>
      );
    }
    return (
      <Badge bg="success" pill>
        <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
        Низкий риск
      </Badge>
    );
  };

  const renderRouteStatus = (status) => {
    if (status === "waiting") {
      return (
        <Badge bg="secondary" pill>
          Ожидает
        </Badge>
      );
    }
    if (status === "approved") {
      return (
        <Badge bg="success" pill>
          Согласовано
        </Badge>
      );
    }
    return status;
  };

  return (
    <article>
      <Container className="px-0">
        {/* Заголовок страницы */}
        <Row className="d-flex flex-wrap flex-md-nowrap align-items-center py-4">
          <Col className="d-block mb-4 mb-md-0">
            <h1 className="h2 mb-1">Входящая корреспонденция / Новое письмо</h1>
            <p className="mb-0 text-muted">
              Загрузка письма, автоанализ, выбор стиля ответа ИИ и запуск маршрута
              согласования.
            </p>
          </Col>
        </Row>

        {/* Верхний блок: большая зона загрузки + автоанализ + выбор стиля */}
        <Row className="mb-4">
          <Col xl={12}>
            <Card className="shadow-sm h-100">
              <Card.Header>
                <Card.Title className="mb-0">
                  <FontAwesomeIcon icon={faUpload} className="me-2" />
                  Входящее письмо и автоанализ
                </Card.Title>
              </Card.Header>

              <Card.Body>
                <Row>
                  {/* Левая часть — большая зона загрузки файла */}
                  <Col lg={6} className="mb-4 mb-lg-0">
                    <Form.Group controlId="fileInput">
                      <Form.Label>Файл письма (PDF / DOCX / TXT)</Form.Label>
                      <div
                        className={`border rounded p-4 text-center upload-dropzone ${
                          isDragOver ? "bg-primary bg-opacity-10 border-primary" : "bg-light border-dashed"
                        }`}
                        style={{ minHeight: 200, display: "flex", flexDirection: "column", justifyContent: "center" }}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <div className="mb-3">
                          <FontAwesomeIcon icon={faUpload} size="2x" className="mb-2 text-muted" />
                          <div className="fw-semibold">
                            {fileName ? "Файл выбран" : "Перетащите файл письма сюда"}
                          </div>
                          <div className="small text-muted">
                            или выберите через диалог ниже
                          </div>
                        </div>

                        <div className="d-flex justify-content-center">
                          <Form.Control
                            type="file"
                            accept=".pdf,.doc,.docx,.txt"
                            onChange={handleFileChange}
                            style={{ maxWidth: 320 }}
                          />
                        </div>

                        {fileName && (
                          <div className="small mt-3">
                            <FontAwesomeIcon icon={faFileAlt} className="me-1" />
                            Выбран файл: <strong>{fileName}</strong>
                          </div>
                        )}
                      </div>
                    </Form.Group>

                    <div className="mt-3 d-flex flex-wrap gap-2">
                      <Button variant="primary" onClick={handleAnalyze}>
                        <FontAwesomeIcon icon={faPlay} className="me-2" />
                        Запустить анализ письма
                      </Button>
                      <Button variant="outline-secondary" onClick={handleClear}>
                        <FontAwesomeIcon icon={faBroom} className="me-2" />
                        Очистить
                      </Button>
                    </div>
                  </Col>

                  {/* Правая часть — автоанализ + выбор стиля ответа ИИ */}
                  <Col lg={6}>
                    <div className="mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <FontAwesomeIcon icon={faBolt} className="me-2 text-warning" />
                        <h5 className="mb-0">Автоанализ письма (черновик)</h5>
                      </div>
                      <p className="text-muted small mb-3">
                        На основе текста письма система определяет тип обращения, рекомендуемый
                        SLA, уровень риска и предлагает стиль ответа ИИ.
                      </p>

                      <ListGroup variant="flush" className="mb-3">
                        <ListGroup.Item className="px-0 d-flex justify-content-between">
                          <span className="text-muted">Тип обращения</span>
                          <span className="fw-semibold text-end">{analysis.type}</span>
                        </ListGroup.Item>

                        <ListGroup.Item className="px-0 d-flex justify-content-between">
                          <span className="text-muted">Рекомендуемый SLA</span>
                          <span className="fw-semibold">
                            <FontAwesomeIcon icon={faClock} className="me-1" />
                            {analysis.slaHours} ч
                          </span>
                        </ListGroup.Item>

                        <ListGroup.Item className="px-0 d-flex justify-content-between align-items-center">
                          <span className="text-muted">Юридический риск</span>
                          <span>{renderRisk(analysis.risk)}</span>
                        </ListGroup.Item>

                        <ListGroup.Item className="px-0">
                          <div className="text-muted mb-1">Рекомендуемые согласующие</div>
                          {analysis.approvers.map((a, idx) => (
                            <div
                              key={idx}
                              className="small d-flex align-items-center mb-1"
                            >
                              <FontAwesomeIcon
                                icon={
                                  idx === 0
                                    ? faShieldAlt
                                    : idx === 1
                                    ? faBuilding
                                    : faUserTie
                                }
                                className="me-2 text-muted"
                              />
                              <span>{a}</span>
                            </div>
                          ))}
                        </ListGroup.Item>
                      </ListGroup>
                    </div>

                    {/* Выбор стиля ответа ИИ — акцентный блок */}
                    <Card className="border-0 bg-light">
                      <Card.Body>
                        <div className="fw-semibold mb-2">
                          Выберите стиль ответа ИИ
                        </div>
                        <div className="small text-muted mb-3">
                          Стиль будет применён при генерации черновика ответа и может быть
                          изменён позже на экране результата.
                        </div>

                        <div className="d-flex flex-column gap-2">
                          {STYLE_OPTIONS.map((opt) => (
                            <Button
                              key={opt.id}
                              variant={opt.id === selectedStyle ? "primary" : "outline-primary"}
                              size="sm"
                              className="d-flex justify-content-between align-items-center text-start"
                              onClick={() => {
                                setSelectedStyle(opt.id);
                                addLog(`Выбран стиль ответа ИИ: "${opt.title}"`);
                              }}
                            >
                              <span>
                                <div className="fw-semibold">{opt.title}</div>
                                <div className="small opacity-75">{opt.desc}</div>
                              </span>
                              {opt.id === selectedStyle && (
                                <Badge bg="light" text="primary" pill>
                                  Выбран
                                </Badge>
                              )}
                            </Button>
                          ))}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Средний блок: варианты ответов + маршрут согласования */}
        <Row className="mb-4">
          {/* Варианты ответов ИИ */}
          <Col lg={7} className="mb-4 mb-lg-0">
            <Card className="shadow-sm h-100">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <Card.Title className="mb-0">Варианты ответов ИИ</Card.Title>
                <InputGroup style={{ maxWidth: 260 }}>
                  <InputGroup.Text>
                    <FontAwesomeIcon icon={faSearch} />
                  </InputGroup.Text>
                  <Form.Control size="sm" placeholder="Фильтр по типу / тону" />
                </InputGroup>
              </Card.Header>
              <Card.Body>
                <ListGroup variant="flush" className="variants-list">
                  {replyVariants.map((v) => (
                    <ListGroup.Item
                      key={v.id}
                      className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center"
                    >
                      <div className="mb-2 mb-lg-0">
                        <div className="fw-semibold mb-1">{v.label}</div>
                        <div className="small text-muted">
                          {v.tone} · {v.size}
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => handleUseVariant(v)}
                        >
                          Использовать вариант
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>

          {/* Маршрут согласования */}
          <Col lg={5}>
            <Card className="shadow-sm h-100">
              <Card.Header>
                <Card.Title className="mb-0">
                  <FontAwesomeIcon icon={faSitemap} className="me-2" />
                  Маршрут согласования
                </Card.Title>
              </Card.Header>
              <Card.Body className="p-0">
                <Table hover responsive className="mb-0">
                  <thead className="thead-light">
                    <tr>
                      <th>Подразделение</th>
                      <th>SLA</th>
                      <th>Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {route.map((r) => (
                      <tr key={r.id}>
                        <td>{r.unit}</td>
                        <td>{r.sla}</td>
                        <td>{renderRouteStatus(r.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Журнал действий */}
        <Row>
          <Col>
            <Card className="shadow-sm">
              <Card.Header>
                <Card.Title className="mb-0">Журнал действий</Card.Title>
              </Card.Header>
              <Card.Body className="p-0">
                <ListGroup variant="flush">
                  {log.map((entry) => (
                    <ListGroup.Item
                      key={entry.id}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <span>{entry.text}</span>
                      <span className="text-muted small">
                        {entry.ts.toLocaleTimeString()}
                      </span>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </article>
  );
};

export default MainPage;
