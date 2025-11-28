// src/pages/Second.js
import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Form,
  ListGroup,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCheckCircle,
  faExclamationTriangle,
  faHighlighter,
  faCopy,
  faAlignLeft,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { Routes } from "../routes";

const STYLE_PRESETS = {
  strict: {
    label: "Строгий официальный",
    description: "для регуляторов и госорганов",
    body: `Уважаемые коллеги!

В ответ на Ваш запрос от 10.10.2024 №123/БН сообщаем следующее.

Банк выполнил анализ операций за III квартал 2024 года по указанным Вами критериям. По результатам проверки нарушений нормативных требований не выявлено. Детализированная выгрузка по операциям прилагается в формате, согласованном с Банком России.

В случае необходимости предоставления дополнительных разъяснений Банк готов оперативно их представить.

С уважением,
АО «Банк пример»
Департамент взаимодействия с регуляторами`,
  },
  corporate: {
    label: "Деловой корпоративный",
    description: "для партнёров и корпоративных клиентов",
    body: `Добрый день!

Благодарим за обращение и подтверждаем получение Вашего письма от 10.10.2024 по вопросам отчётности за III квартал 2024 года.

Мы подготовили консолидированную информацию по интересующим Вас показателям и предлагаем использовать приложенный файл в качестве официального отчёта. При необходимости готовы согласовать формат и структуру данных под Ваши внутренние стандарты.

Если у Вас возникнут дополнительные вопросы, пожалуйста, дайте знать — мы оперативно вернёмся с ответом.

С уважением,
АО «Банк пример»`,
  },
  client: {
    label: "Клиентоориентированный",
    description: "для клиентов и заявителей",
    body: `Здравствуйте!

Спасибо за обращение и предоставленную информацию. Мы внимательно рассмотрели Ваш запрос и подготовили подробный ответ по всем обозначенным вопросам.

В приложении Вы найдёте:
• разъяснения по порядку формирования отчётности;
• информацию о применяемых нормативных требованиях;
• комментарии по операциям за III квартал 2024 года.

Если что-то останется неясным, пожалуйста, напишите нам — мы уточним детали и поможем с дальнейшими шагами.

С уважением,
Команда АО «Банк пример»`,
  },
  short: {
    label: "Краткий информационный",
    description: "для простых запросов и служебных записок",
    body: `Добрый день!

В ответ на Ваш запрос информируем, что анализ операций за III квартал 2024 года выполнен, нарушений не выявлено. Детализированный отчёт прилагается.

С уважением,
АО «Банк пример»`,
  },
};

const Second = () => {
  const [styleKey, setStyleKey] = useState("strict");
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(STYLE_PRESETS.strict.body);

  const currentStyle = STYLE_PRESETS[styleKey];

  const handleStyleChange = (key) => {
    setStyleKey(key);
    setText(STYLE_PRESETS[key].body); // потом можно сделать «не сбрасывать», если надо
  };

  const handleCopy = () => {
    // пока просто лог, позже подвесим navigator.clipboard.writeText
    // eslint-disable-next-line no-console
    console.log("Копирование текста ответа:\n", text);
  };

  return (
    <article>
      <Container className="px-0">
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
                К списку писем
              </Button>
              <div>
                <h1 className="h2 mb-1">Сгенерированный ответ</h1>
                <p className="mb-0 text-muted">
                  Черновик письма, подготовленный ИИ. Можно сменить стиль, отредактировать и
                  скопировать в почтовый клиент.
                </p>
              </div>
            </div>
          </Col>
        </Row>

        {/* Бейджи по письму */}
        <Row className="mb-3">
          <Col>
            <div className="d-flex flex-wrap gap-2">
              <Badge bg="primary">Адресат: Банк России</Badge>
              <Badge bg="info" text="light">
                Тип: Регуляторный запрос
              </Badge>
              <Badge bg="secondary">
                SLA ответа: <strong>24 часа</strong>
              </Badge>
              <Badge bg="warning" text="dark">
                <FontAwesomeIcon icon={faExclamationTriangle} className="me-1" />
                Требуется согласование ЮЛ / Комплаенс
              </Badge>
            </div>
          </Col>
        </Row>

        <Row className="mb-4">
          {/* ЛЕВАЯ ПОЛОВИНА — текст письма */}
          <Col lg={8} className="mb-4 mb-lg-0">
            <Card className="shadow-sm h-100">
              <Card.Header className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                <div>
                  <Card.Title className="mb-0">
                    <FontAwesomeIcon icon={faAlignLeft} className="me-2" />
                    Тело письма
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
                    {isEditing ? "Закончить редактирование" : "Редактировать текст"}
                  </Button>
                  <Button size="sm" variant="outline-secondary" onClick={handleCopy}>
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
                    {text}
                  </pre>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* ПРАВАЯ ПОЛОВИНА — пересказ + риски + версии */}
          <Col lg={4}>
            {/* Краткий пересказ */}
            <Card className="shadow-sm mb-4">
              <Card.Header>
                <Card.Title className="mb-0">Краткий пересказ письма</Card.Title>
              </Card.Header>
              <Card.Body>
                <p className="mb-2">
                  Система кратко резюмирует смысл подготовленного ответа. Можно использовать
                  это как ..... для руководителей.
                </p>
                <ul className="mb-0">
                  <li>
                    Подтверждаем получение запросa регулятора и выполненный анализ операций.
                  </li>
                  <li>Сообщаем об отсутствии нарушений и прикладываем детальный отчёт.</li>
                  <li>
                    Готовы предоставить дополнительные пояснения по запросу регулятора в
                    кратчайшие сроки.
                  </li>
                </ul>
              </Card.Body>
            </Card>

            {/* Риски и акценты */}
            <Card className="shadow-sm mb-4">
              <Card.Header>
                <Card.Title className="mb-0">
                  Ключевые риски и акценты
                </Card.Title>
              </Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  <ListGroup.Item className="px-0 d-flex gap-2">
                    <FontAwesomeIcon
                      icon={faExclamationTriangle}
                      className="mt-1 text-warning"
                    />
                    <span className="small">
                      Избегать категоричных формулировок о «полном отсутствии рисков» —
                      использовать нейтральные формулировки («нарушений не выявлено»).
                    </span>
                  </ListGroup.Item>
                  <ListGroup.Item className="px-0 d-flex gap-2">
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="mt-1 text-success"
                    />
                    <span className="small">
                      Подчеркнуть готовность оперативно предоставить дополнительные
                      разъяснения и документы.
                    </span>
                  </ListGroup.Item>
                  <ListGroup.Item className="px-0 d-flex gap-2">
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="mt-1 text-success"
                    />
                    <span className="small">
                      Зафиксировать ссылки на приложенные файлы (отчёт, выгрузка, пояснения)
                      во внутренней системе.
                    </span>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>

            {/* Версии ответа */}
            <Card className="shadow-sm">
              <Card.Header>
                <Card.Title className="mb-0">Версии ответа</Card.Title>
              </Card.Header>
              <Card.Body className="p-0">
                <ListGroup variant="flush">
                  <ListGroup.Item className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-semibold">Черновик №1</div>
                      <div className="small text-muted">
                        Строгий официальный, создан 10:15
                      </div>
                    </div>
                    <Badge bg="secondary" pill>
                      Текущий
                    </Badge>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-semibold">Вариант для клиента</div>
                      <div className="small text-muted">
                        Клиентоориентированный, создан 10:12
                      </div>
                    </div>
                    <Button size="sm" variant="outline-primary">
                      Открыть
                    </Button>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </article>
  );
};

export default Second;
