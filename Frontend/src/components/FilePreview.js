import React, { useEffect, useState } from "react";
import api from "../api";
import { Button } from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

function getExt(name="") {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot+1).toLowerCase() : "";
}
function isTextExt(ext) {
  return ["txt","md","csv","json","xml","yaml","yml","log"].includes(ext);
}
function canEmbedPdf(ext) {
  return ext === "pdf";
}

export function FilePreview({ productId, file, onClose }) {
  const [loading, setLoading] = useState(false);
  const [blobUrl, setBlobUrl] = useState(null);
  const [text, setText] = useState(null);
  const [error, setError] = useState(null);

  const ext = getExt(file?.name || "");
  const canText = isTextExt(ext);
  const canPdf = canEmbedPdf(ext);

  useEffect(() => {
    let url = null;
    setLoading(true);
    setError(null);
    setBlobUrl(null);
    setText(null);

    console.log('GET /download', `tree-product/${productId}/download`, { params: { path: file.path } });
    api.get(`tree-product/${productId}/download-file`, {
      params: { path: file.path },
      responseType: "blob",
    })
      .then(async ({ data }) => {
        if (canText) {
          try { setText(await data.text()); }
          catch { setError("Не удалось прочитать файл как текст"); }
        } else if (canPdf) {
          url = URL.createObjectURL(data);
          setBlobUrl(url);
        } else {
          // неподдерживаемый inline-просмотр (doc/docx/и т.п.)
          url = URL.createObjectURL(data);
          setBlobUrl(url); // оставим для кнопки «скачать», а ниже покажем подсказку
        }
      })
      .catch(() => setError("Не удалось загрузить файл"))
      .finally(() => setLoading(false));

    return () => { if (url) URL.revokeObjectURL(url); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, file?.path]);

  const descr = (() => {
    // описание как в таблице: то, что после первого пробела до расширения
    const base = (file?.name || "").replace(/\/?.*\//, "");
    const dot = base.lastIndexOf(".");
    const noExt = dot > 0 ? base.slice(0, dot) : base;
    const i = noExt.indexOf(" ");
    return i > 0 ? noExt.slice(i + 1) : "";
  })();

  const sizeText = typeof file?.size === "number" ? formatBytes(file.size) : "";

  const download = () => {
    if (!productId || !file?.path) return;
    api.get(`tree-product/${productId}/download-file`, {
      params: { path: file.path },
      responseType: "blob",
    }).then(({ data }) => {
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = file?.name || "file";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="p-2">
      {/* Шапка превью */}
      <div className="d-flex align-items-center justify-content-between border-bottom px-3 py-2">
        <div className="small">
          <strong>{file?.name}</strong>
          {sizeText && <span className="text-muted ms-2">· {sizeText}</span>}
          {descr && <span className="text-muted ms-2">· {descr}</span>}
        </div>
        <div className="d-flex gap-2">
          <Button size="sm" variant="outline-secondary" onClick={onClose}>Назад к списку</Button>
          <Button size="sm" variant="outline-primary" onClick={download} title="Скачать">
            <FontAwesomeIcon icon={faDownload} /> <span className="ms-1">Скачать</span>
          </Button>
        </div>
      </div>

      {/* Тело превью */}
      <div className="p-3">
        {loading && <div className="text-muted">Загрузка…</div>}
        {error && <div className="text-danger">{error}</div>}

        {!loading && !error && canPdf && blobUrl && (
          <iframe
            title="pdf-preview"
            src={blobUrl}
            style={{ width: "100%", height: "120vh", border: "1px solid var(--bs-border-color)", borderRadius: 8 }}
          />
        )}

        {!loading && !error && canText && (
          <pre
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              background: "var(--bs-light)",
              border: "1px solid var(--bs-border-color)",
              borderRadius: 8,
              padding: 12,
              maxHeight: "70vh",
              overflow: "auto",
              margin: 0
            }}
          >
            {text ?? ""}
          </pre>
        )}

        {!loading && !error && !canPdf && !canText && (
          <div className="text-muted">
            Предпросмотр для этого типа файла не поддерживается в браузере.
            Используйте кнопку «Скачать», чтобы открыть его локально (например, в Microsoft Word).
          </div>
        )}
      </div>
    </div>
  );
}

// вспомогательная — можешь перенести в общий helpers
function formatBytes(b) {
  if (b == null) return "";
  const u = ["B","KB","MB","GB","TB"]; let i=0, v=Number(b);
  while (v >= 1024 && i < u.length-1) { v/=1024; i++; }
  return `${v.toFixed(v<10&&i>0?1:0)} ${u[i]}`;
}
