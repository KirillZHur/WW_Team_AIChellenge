import { useCallback, useRef, useState } from "react";
import debounce from "lodash.debounce";
import { Modal, Button, Form, Card } from "@themesberg/react-bootstrap";
import { useDropzone } from "react-dropzone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faTimes, faFileArchive } from "@fortawesome/free-solid-svg-icons";
import Progress from "../components/Progress";
import api from "../api";

export default function UploadArchiveModal({ show, onHide, onUploadZip, onUploadFolder, progress }) {
  const [zipFile, setZipFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [nameOk, setNameOk] = useState(null);
  const [comment, setComment] = useState("");

  const zipInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const isZip = (f) => {
    if (!f) return false;
    const byExt = f.name?.toLowerCase().endsWith(".zip");
    const byType = ["application/zip", "application/x-zip-compressed", "multipart/x-zip"].includes(f.type);
    return !!(byExt || byType);
  };

  /** DnD: один .zip -> режим zip; иначе считаем, что папка/набор файлов */
  const onDrop = useCallback((accepted) => {
    if (!accepted || accepted.length === 0) {
      setFiles([]);
      setZipFile(null);
      return;
    }
    if (accepted.length === 1 && isZip(accepted[0]) && !accepted[0].webkitRelativePath) {
      setZipFile(accepted[0]);
      setFiles([]);
    } else {
      setZipFile(null);
      setFiles(accepted);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    // ВАЖНО: тут НЕ ставим webkitdirectory — это ломает UX для DnD.
    // Выбор папки делаем отдельной кнопкой ниже.
  });

  /** Выбор ZIP через кнопку */
  const onPickZip = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!isZip(f)) {
      // можно всплывашку/тост, но минимально просто игнор
      e.target.value = "";
      return;
    }
    setZipFile(f);
    setFiles([]);
    e.target.value = "";
  };

  /** Выбор папки через кнопку (webkitdirectory) */
  const onPickFolder = (e) => {
    const list = Array.from(e.target.files || []);
    if (!list.length) return;
    setFiles(list);     // у каждого файла будет webkitRelativePath
    setZipFile(null);
    e.target.value = "";
  };

  const reset = () => {
    setZipFile(null);
    setFiles([]);
    setName("");
    setComment("");
    setNameOk(null);
  };

  const handleSave = () => {
    if (!nameOk || !comment.trim()) return;

    if (zipFile) {
      onUploadZip({
        file: zipFile,
        name: name.trim(),
        comment: comment.trim(),
      });
    } else if (files.length > 0) {
      onUploadFolder({
        files,
        name: name.trim(),
        comment: comment.trim(),
      });
    } else {
      return;
    }

    reset();
    onHide();
  };

  const checkName = useCallback(
    debounce(async (value) => {
      if (!value.trim()) return setNameOk(false);
      try {
        const { data } = await api.get("/products/exists", { params: { name: value } });
        setNameOk(!data.exists);
      } catch {
        setNameOk(false);
      }
    }, 400),
    []
  );

  const hasSelection = !!zipFile || files.length > 0;

  return (
    <Modal as={Modal.Dialog} size="lg" centered show={show} onHide={onHide}>
      <Modal.Header>
        <Modal.Title className="h5">Импорт архива или папки</Modal.Title>
        <Button variant="close" aria-label="Close" onClick={onHide} />
      </Modal.Header>

      <Modal.Body>
        {/* Drag-and-drop зона */}
        <Card
          {...getRootProps()}
          className={`p-4 border-dashed text-center ${isDragActive ? "bg-light" : "bg-white"} cursor-pointer`}
        >
          <input {...getInputProps()} />
          <FontAwesomeIcon icon={faUpload} size="2x" className="mb-3 text-primary" />
          <p className="mb-1">
            {isDragActive ? "Отпустите, чтобы загрузить" : "Перетащите ZIP или папку"}
          </p>
          <p className="text-gray small mb-0">Максимум 1 Гбайт</p>
        </Card>

        {/* Кнопки выбора через проводник */}
        <div className="d-flex gap-2 mt-2">
          <Button size="sm" variant="outline-primary" onClick={() => zipInputRef.current?.click()}>
            Выбрать ZIP
          </Button>
          <input
            ref={zipInputRef}
            type="file"
            accept=".zip"
            style={{ display: "none" }}
            onChange={onPickZip}
          />

          <Button size="sm" variant="outline-secondary" onClick={() => folderInputRef.current?.click()}>
            Выбрать папку
          </Button>
          <input
            ref={folderInputRef}
            type="file"
            multiple
            webkitdirectory="true"
            directory="true"
            style={{ display: "none" }}
            onChange={onPickFolder}
          />
        </div>

        {/* Превью выбора */}
        {zipFile && (
          <Card className="mt-3">
            <Card.Body className="d-flex align-items-center">
              <FontAwesomeIcon icon={faFileArchive} className="me-3 text-secondary" />
              <div className="flex-grow-1">
                <div className="fw-bold">{zipFile.name}</div>
                <div className="text-gray small">{(zipFile.size / 1024 / 1024).toFixed(2)} MB</div>
              </div>
              <Button size="sm" variant="outline-danger" onClick={reset}>
                <FontAwesomeIcon icon={faTimes} />
              </Button>
            </Card.Body>
          </Card>
        )}

        {!zipFile && files.length > 0 && (
          <Card className="mt-3">
            <Card.Body className="d-flex align-items-center">
              <div className="flex-grow-1">
                <div className="fw-bold">Выбрано файлов: {files.length}</div>
                <div className="text-gray small">
                  пример пути: {files[0].webkitRelativePath || files[0].name}
                </div>
              </div>
              <Button size="sm" variant="outline-danger" onClick={reset}>
                <FontAwesomeIcon icon={faTimes} />
              </Button>
            </Card.Body>
          </Card>
        )}

        {/* Поля имени и комментария */}
        <Form.Group className="mt-4">
          <Form.Label>Название изделия *</Form.Label>
          <Form.Control
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              checkName(e.target.value);
            }}
            isInvalid={!!name && nameOk === false}
            isValid={nameOk === true}
            placeholder="Напр. Меггаометр-КД"
          />
          <Form.Control.Feedback type="invalid" tooltip>
            Такое имя уже есть в базе
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mt-4">
          <Form.Label>Комментарий к версии</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={!hasSelection}
          />
        </Form.Group>

        {progress > 0 && <Progress variant="primary" value={progress} label={`${progress}%`} />}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Отмена
        </Button>
        <Button
          variant="primary"
          disabled={!hasSelection || !nameOk || !comment.trim() || (progress > 0 && progress < 100)}
          onClick={handleSave}
        >
          Загрузить
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
