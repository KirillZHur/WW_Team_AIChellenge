// src/pages/MainPage.js
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Spinner,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faFileAlt, faPlay } from "@fortawesome/free-solid-svg-icons";
import { Routes } from "../routes";

const STYLE_OPTIONS = [
  { id: "strict",     title: "Строгий официальный",     desc: "Для регуляторов и госорганов" },
  { id: "corporate",  title: "Деловой корпоративный",   desc: "Для партнёров и корпоративных клиентов" },
  { id: "client",     title: "Клиентоориентированный",  desc: "Для клиентов и заявителей" },
  { id: "short",      title: "Краткий информационный",  desc: "Для простых запросов и служебных записок" },
];

// маппинг стилей UI → значения в API
const STYLE_TO_API = {
  strict:    "OFFICIAL_REGULATOR",
  corporate: "CORPORATE",
  client:    "CLIENT",
  short:     "SHORT_INFO",
};

const API_BASE = "/api/v1";

const MainPage = () => {
  const history = useHistory();

  const [file, setFile] = useState(null);      // сам File
  const [fileName, setFileName] = useState(""); // только имя для UI
  const [title, setTitle] = useState("");
  const [styleId, setStyleId] = useState("strict");
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const applyFile = (newFile) => {
    if (!newFile) return;
    setFile(newFile);
    setFileName(newFile.name);

    // если название пустое – подставляем имя файла без расширения
    if (!title) {
      const base = newFile.name.replace(/\.[^/.]+$/, "");
      setTitle(base);
    }
    setError(null);
  };

  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    applyFile(f);
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
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    applyFile(f);
  };

  const handleClear = () => {
    setFile(null);
    setFileName("");
    setTitle("");
    setError(null);
  };

  // --- основное действие: создать письмо + запустить генерацию драфта ---
  const handleGenerate = async () => {
    if (!file) {
      setError("Пожалуйста, выберите файл письма.");
      return;
    }
    if (!title.trim()) {
      setError("Укажите название генерации.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      // 1) создаём письмо (метаданные + файл)
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title.trim());
      formData.append("preferredStyle", STYLE_TO_API[styleId]);

      // предполагаем POST /api/v1/letters (201)
      const letterRes = await fetch(`${API_BASE}/letters`, {
        method: "POST",
        body: formData,
      });

      if (!letterRes.ok) {
        throw new Error(`Ошибка создания письма: ${letterRes.status}`);
      }

      const letter = await letterRes.json();
      const letterId = letter.id;

      const draftRes = await fetch(`${API_BASE}/letters/${letterId}/drafts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          style: STYLE_TO_API[styleId], // OFFICIAL_REGULATOR и т.п.
        }),
      });

      if (!draftRes.ok) {
        throw new Error(`Ошибка запуска генерации черновика: ${draftRes.status}`);
      }

      // по твоей спецификации: 202 + { id, status: "GENERATING" }
      const draft = await draftRes.json();
      const draftId = draft.id;

      // 3) уходим на экран ответа с параметрами
      history.push(`${Routes.Second.path}?letterId=${letterId}&draftId=${draftId}`);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setError(
        "Не удалось запустить генерацию ответа. Проверьте подключение к серверу и попробуйте ещё раз."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStyle = STYLE_OPTIONS.find((s) => s.id === styleId);

  return (
    <article>
      <Container fluid className="px-3 px-md-4">
        {/* Заголовок страницы */}
        <Row className="d-flex flex-wrap flex-md-nowrap align-items-center py-4">
          <Col className="d-block mb-4 mb-md-0">
            <h1 className="h2 mb-1">Новое письмо</h1>
            <p className="mb-0 text-muted">
              Загрузите файл, задайте название генерации и стиль ответа ИИ.
              Вся детализация анализа и текста будет на следующем экране.
            </p>
          </Col>
        </Row>

        <Row>
          <Col lg={8} className="mb-4">
            <Card className="shadow-sm h-100">
              <Card.Body>
                {/* Большая зона загрузки */}
                <Form.Group controlId="fileInput">
                  <Form.Label>Файл письма (PDF / DOCX / TXT)</Form.Label>
                  <div
                    className={`border rounded p-4 text-center upload-dropzone ${
                      isDragOver
                        ? "bg-primary bg-opacity-10 border-primary"
                        : "bg-light border-dashed"
                    }`}
                    style={{
                      minHeight: 220,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="mb-3">
                      <FontAwesomeIcon
                        icon={faUpload}
                        size="2x"
                        className="mb-2 text-muted"
                      />
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

                {/* Название генерации */}
                <Form.Group controlId="generationTitle" className="mt-4">
                  <Form.Label>Название генерации</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Например: Запрос ЦБ по отчётности за Q3 2024"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <Form.Text className="text-muted">
                    Это имя будет отображаться в списке сессий слева (как в чате).
                  </Form.Text>
                </Form.Group>

                {/* Ошибка валидации / API */}
                {error && (
                  <div className="text-danger small mt-2">{error}</div>
                )}

                {/* Кнопки */}
                <div className="mt-4 d-flex flex-wrap gap-2">
                  <Button
                    variant="primary"
                    onClick={handleGenerate}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          role="status"
                          className="me-2"
                        />
                        Генерируем...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faPlay} className="me-2" />
                        Сгенерировать ответ ИИ
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={handleClear}
                    disabled={isSubmitting}
                  >
                    Сбросить
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Справа — выбор стиля (акцентный, но компактный блок) */}
          <Col lg={4} className="mb-4">
            <Card className="shadow-sm h-100">
              <Card.Header>
                <Card.Title className="mb-0">Стиль ответа ИИ</Card.Title>
              </Card.Header>
              <Card.Body>
                <p className="small text-muted">
                  Стиль будет применён при генерации черновика. Его можно будет
                  поменять на экране ответа.
                </p>

                <div className="d-flex flex-column gap-2">
                  {STYLE_OPTIONS.map((opt) => (
                    <Button
                      key={opt.id}
                      variant={
                        opt.id === styleId ? "primary" : "outline-primary"
                      }
                      size="sm"
                      className="text-start"
                      onClick={() => setStyleId(opt.id)}
                      disabled={isSubmitting}
                    >
                      <div className="fw-semibold">{opt.title}</div>
                      <div className="small opacity-75">{opt.desc}</div>
                    </Button>
                  ))}
                </div>

                {currentStyle && (
                  <div className="mt-3 small text-muted">
                    Текущий выбор: <strong>{currentStyle.title}</strong>.
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </article>
  );
};

export default MainPage;
