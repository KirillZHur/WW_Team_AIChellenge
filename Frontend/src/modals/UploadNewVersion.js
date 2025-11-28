import api from "../api";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal, Button, Form, Card, Table, Badge, Spinner, Alert, InputGroup } from "@themesberg/react-bootstrap";
// import { useDropzone } from "react-dropzone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faTimes, faFileArchive, faChevronLeft, faChevronRight, faCheck, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import DropSelectArea from "../components/DropSelectArea";

// Небольшой Progress без внешних зависимостей
function LineProgress({ value }) {
  const safe = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="progress" style={{ height: 8 }}>
      <div className="progress-bar" role="progressbar" style={{ width: `${safe}%` }} aria-valuenow={safe} aria-valuemin="0" aria-valuemax="100" />
    </div>
  );
}

const CHANGE_BADGE = {
  ADDED:   { text: "Добавлен",  variant: "success" },
  MODIFIED:{ text: "Изменён",   variant: "warning" },
  DELETED: { text: "Удалён",    variant: "danger"  },
};

const formatBytes = (n) => {
  if (n == null) return "—";
  const s = ["B","KB","MB","GB","TB"];
  let i = 0, v = Number(n);
  while (v >= 1024 && i < s.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v < 10 ? 2 : v < 100 ? 1 : 0)} ${s[i]}`;
};

export default function UploadNewVersion({ show, onHide, product, onUploaded }) {
  const [step, setStep] = useState("select"); // select | preview | submit
  const [zipFile, setZipFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [globalComment, setGlobalComment] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [diff, setDiff] = useState([]); // [{ path, changeType, sizeOld, sizeNew }]
  const [rowComments, setRowComments] = useState({}); // { path: string }
  const [selected, setSelected] = useState({}); // { path: boolean }
  const [progress, setProgress] = useState(0);
  const [previewId, setPreviewId] = useState(null);

  // для «Выбрать ZIP» / «Выбрать папку»
  const zipInputRef = useRef(null);
  const folderInputRef = useRef(null);

  // Сброс состояния при открытии/закрытии
  useEffect(() => {
    if (!show) return;
    resetAll();
  }, [show]);

  const isZip = (f) => {
    if (!f) return false;
    const byExt = f.name?.toLowerCase().endsWith(".zip");
    const byType = ["application/zip", "application/x-zip-compressed", "multipart/x-zip"].includes(f.type);
    return !!(byExt || byType);
  };

  // const onDrop = useCallback((accepted) => {
  //   setError(null);
  //   if (!accepted || accepted.length === 0) {
  //     setFiles([]);
  //     setZipFile(null);
  //     return;
  //   }
  //   if (accepted.length === 1 && isZip(accepted[0]) && !accepted[0].webkitRelativePath) {
  //     setZipFile(accepted[0]);
  //     setFiles([]);
  //   } else {
  //     setZipFile(null);
  //     setFiles(accepted);
  //   }
  // }, []);

  // const { getRootProps, getInputProps, isDragActive } = useDropzone({
  //   onDrop,
  //   multiple: true,
  // });

  const onPickZip = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!isZip(f)) {
      e.target.value = "";
      return;
    }
    setZipFile(f);
    setFiles([]);
    setError(null);
    e.target.value = "";
  };

  const onPickFolder = (e) => {
    const list = Array.from(e.target.files || []);
    if (!list.length) return;
    setFiles(list);
    setZipFile(null);
    setError(null);
    e.target.value = "";
  };

  const hasSelection = !!zipFile || files.length > 0;
  const canProceedPreview = hasSelection;

  const resetAll = () => {
    setStep("select");
    setZipFile(null);
    setFiles([]);
    setGlobalComment("");
    setDetecting(false);
    setSubmitting(false);
    setError(null);
    setDiff([]);
    setRowComments({});
    setSelected({});
    setPreviewId(null);
    setProgress(0);
  };

  // Предпросмотр изменений — dry-run
  const handlePreview = async () => {
    if (!product?.id || !canProceedPreview) return;
    try {
      setDetecting(true);
      setError(null);
      setDiff([]);
      setRowComments({});
      setSelected({});
      setProgress(20);

      const form = new FormData();
      let url = "";
      if (zipFile) {
        url = `/version-changes/${product.id}/preview-archive`;
        form.append("newArchive", zipFile);
      } else {
        url = `/version-changes/${product.id}/preview-folder`;
        files.forEach(f => form.append("newFolder", f, f.webkitRelativePath || f.name));
      }

      const { data } = await api.post(url, form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (!evt.total) return;
          const pct = Math.round((evt.loaded / evt.total) * 70) + 20; // 20-90% визуал
          setProgress(Math.min(90, pct));
        },
      });

      setDiff(Array.isArray(data) ? data : (data.diff || []));
      setPreviewId(data.previewId || null);
      setProgress(100);
      setStep("preview");
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Не удалось получить список изменений");
    } finally {
      setDetecting(false);
      setTimeout(() => setProgress(0), 800);
    }
  };

  // Массово заполнить комментарий для выделенных строк
  const applyBulkComment = () => {
    if (!globalComment.trim()) return;
    const next = { ...rowComments };
    Object.entries(selected).forEach(([path, isSel]) => {
      if (isSel) next[path] = globalComment;
    });
    setRowComments(next);
  };

  const allRequiredCommented = useMemo(() => {
    if (!diff.length) return false;
    return diff.every(row => (rowComments[row.path] || "").trim().length > 0);
  }, [diff, rowComments]);

  const anySelected = useMemo(() => Object.values(selected).some(Boolean), [selected]);

  const toggleSelectAll = (v) => {
    const next = {};
    diff.forEach(d => { next[d.path] = !!v; });
    setSelected(next);
  };

  // Отправка новой версии
  const handleSubmit = async () => {
    if (!product?.id || !hasSelection || !allRequiredCommented) return;
    try {
      setSubmitting(true);
      setError(null);
      setProgress(20);

      const form = new FormData();
      if (previewId) {
        form.append("previewId", previewId);
      } else if (zipFile) {
        form.append("newArchive", zipFile);
      } else {
        files.forEach((f) => form.append("newFolder", f, f.webkitRelativePath || f.name));
      }
      form.append("commentsJson", JSON.stringify(rowComments));
      form.append("globalComment", globalComment || "");

      await api.post(`/versions/${product.id}/upload-new-version`, form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (!evt.total) return;
          const pct = Math.round((evt.loaded / evt.total) * 80) + 10;
          setProgress(Math.min(100, pct));
        },
      });

      setProgress(100);
      try { onUploaded?.(); } catch {}
      onHide?.();
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Не удалось сохранить новую версию");
    } finally {
      setSubmitting(false);
      setTimeout(() => setProgress(0), 800);
    }
  };

  return (
    <Modal
      as="div"
      centered
      show={show}
      onHide={onHide}
      fullscreen
      scrollable
      dialogClassName="upload-version-dialog"
    >
      <Modal.Header>
        <Modal.Title className="h5">
          {step === "select" && <>Новая версия для: <strong>{product?.name || "—"}</strong></>}
          {step === "preview" && <>Предпросмотр изменений — <strong>{product?.name || "—"}</strong></>}
        </Modal.Title>
        <Button variant="close" aria-label="Close" onClick={onHide} />
      </Modal.Header>

      <Modal.Body>
        {/* <div
          {...getRootProps({ className: `uv-drop-root ${isDragActive ? "is-active" : ""}` })}
        >
          <input {...getInputProps()} /> */}
        
          <div className="preview-scroll">
            {error && (
              <Alert variant="danger" className="mb-3">
                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                {error}
              </Alert>
            )}

            {step === "select" && (
              <DropSelectArea
                fullHeight
                zipFile={zipFile}
                files={files}
                onSelectZip={(f) => { setZipFile(f); setFiles([]); setError(null); }}
                onSelectFolder={(list) => { setFiles(list); setZipFile(null); setError(null); }}
                onClear={() => { setZipFile(null); setFiles([]); }}
                title="Перетащите ZIP или папку с изменениями"
                subtitle="Максимум 1 Гбайт. После выбора покажем список изменений."
              />
            )}

            {step === "preview" && (
              <>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="text-muted small">
                    Найдено изменений: <strong>{diff.length}</strong>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <Form.Check
                      type="checkbox"
                      id="select-all"
                      label="Выбрать все"
                      checked={diff.length > 0 && diff.every(d => !!selected[d.path])}
                      disabled={diff.length === 0}
                      onChange={(e) => toggleSelectAll(!!e.currentTarget.checked)}
                    />
                  </div>
                </div>

                <div className="uv-table-scroll">
                  {/* ВАЖНО: убрали prop responsive у <Table />, чтобы не было горизонтального скролла-обёртки */}
                  <Table hover className="mb-0 align-middle uv-table">
                    <thead className="table-light uv-head-sticky">
                      <tr>
                        <th className="uv-col-xxs"></th>
                        <th className="uv-col-xs">Тип</th>
                        <th className="uv-col-path">Путь</th>
                        <th className="text-end uv-col-s">Было</th>
                        <th className="text-end uv-col-s">Стало</th>
                        <th className="uv-col-comment">Комментарий к файлу *</th>
                      </tr>
                    </thead>
                    <tbody>
                      {diff.map(row => {
                        const badge = CHANGE_BADGE[row.changeType] || { text: row.changeType, variant: "secondary" };
                        return (
                          <tr key={row.path}>
                            <td className="uv-col-xxs">
                              <Form.Check
                                aria-label="select-row"
                                checked={!!selected[row.path]}
                                onChange={(e) => {
                                  const checked = !!e.currentTarget?.checked;
                                  setSelected(s => ({ ...s, [row.path]: checked }));
                                }}
                              />
                            </td>
                            <td className="uv-col-xs"><Badge bg={badge.variant}>{badge.text}</Badge></td>
                            <td className="uv-col-path"><code className="uv-path-code">{row.path}</code></td>
                            <td className="text-end uv-col-s">{formatBytes(row.sizeOld)}</td>
                            <td className="text-end uv-col-s">{formatBytes(row.sizeNew)}</td>
                            <td className="uv-col-comment">
                              <Form.Control
                                size="sm"
                                type="text"
                                placeholder="Что изменилось в этом файле?"
                                value={rowComments[row.path] || ""}
                                isInvalid={!((rowComments[row.path] || "").trim().length > 0)}
                                onChange={(e) => setRowComments(m => ({ ...m, [row.path]: e.target.value }))}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>

                <div className="uv-bulk-scroll mt-3">
                  <Card className="mt-3">
                    <Card.Body>
                      <div className="d-flex gap-2 align-items-center uv-bulk-row">
                        <Form.Label className="mb-0">Массовый комментарий:</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Текст будет проставлен в комментарии выбранных строк"
                          value={globalComment}
                          onChange={(e) => setGlobalComment(e.target.value)}
                        />
                        <Button
                          variant="outline-primary"
                          size="sm"
                          disabled={!anySelected || !globalComment.trim()}
                          onClick={applyBulkComment}
                          title="Заполнить комментарий для отмеченных файлов"
                          style={{ whiteSpace: "nowrap" }}
                        >
                          Заполнить выбранные
                        </Button>
                      </div>
                      <div>
                        <Form.Group className="mt-3" style={{ flex: 1 }}>
                          <Form.Label>Комментарий к версии (общий)</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            value={globalComment}
                            onChange={(e) => setGlobalComment(e.target.value)}
                            placeholder="Например: обновлены схемы и спецификации, исправлены замечания №123"
                          />
                        </Form.Group>
                      </div>
                      <div className="text-muted small mt-2">
                        Комментарии ОБЯЗАТЕЛЬНЫ для всех изменённых/добавленных/удалённых файлов.
                      </div>
                    </Card.Body>
                  </Card>
                </div>
                {(submitting || progress > 0) && <div className="uv-progress"><LineProgress value={progress} /></div>}
              </>
            )}
          </div>
        {/* </div> */}
      </Modal.Body>

      <Modal.Footer className="d-flex justify-content-between">
        <div className="text-muted small">
          {step === "select" && <>Шаг 1 из 2</>}
          {step === "preview" && <>Шаг 2 из 2</>}
        </div>

        <div className="d-flex gap-2">
          {step === "preview" && (
            <Button variant="outline-secondary" onClick={() => setStep("select")} disabled={submitting}>
              <FontAwesomeIcon icon={faChevronLeft} className="me-1" />
              Назад
            </Button>
          )}

          {step === "select" && (
            <Button variant="primary" onClick={handlePreview} disabled={!canProceedPreview || detecting}>
              {detecting ? (<><Spinner animation="border" size="sm" className="me-2" /> Анализ…</>) : (<>Предпросмотр изменений <FontAwesomeIcon icon={faChevronRight} className="ms-1" /></>)}
            </Button>
          )}

          {step === "preview" && (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={submitting || !allRequiredCommented}
              title={!allRequiredCommented ? "Заполните комментарии ко всем строкам" : ""}
            >
              {submitting ? (<><Spinner animation="border" size="sm" className="me-2" /> Сохраняем…</>) : (<>Сохранить новую версию <FontAwesomeIcon icon={faCheck} className="ms-1" /></>)}
            </Button>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
}
