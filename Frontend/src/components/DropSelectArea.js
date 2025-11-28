// src/components/DropSelectArea.jsx
import React, {useRef, useCallback} from "react";
import {Card, Button} from "@themesberg/react-bootstrap";
import {useDropzone} from "react-dropzone";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUpload, faTimes, faFileArchive} from "@fortawesome/free-solid-svg-icons";

function formatBytes(n){
  if (n == null) return "—";
  const s = ["B","KB","MB","GB","TB"];
  let i = 0, v = Number(n);
  while (v >= 1024 && i < s.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v < 10 ? 2 : v < 100 ? 1 : 0)} ${s[i]}`;
}

/**
 * Универсальная зона выбора архива/папки.
 *
 * PROPS:
 * - zipFile: File|null            // контролируемое значение ZIP
 * - files: File[]                 // контролируемое значение папки/набора файлов
 * - onSelectZip(file: File)       // выбран ZIP
 * - onSelectFolder(files: File[]) // выбрана папка/набор файлов
 * - onClear()                     // очистить выбор
 * - title / subtitle              // тексты внутри зоны
 * - fullHeight (bool)             // растягивать на всю доступную высоту
 * - className                     // доп. классы контейнера
 * - marchingBorder (bool)         // «бегущий» штрих-бордер (по умолчанию true)
 */
export default function DropSelectArea({
  zipFile, files,
  onSelectZip, onSelectFolder, onClear,
  title = "Перетащите ZIP или папку с изменениями",
  subtitle = "Максимум 1 Гбайт. После выбора покажем список изменений.",
  fullHeight = false,
  className = "",
  marchingBorder = true,
}) {
  const zipInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const isZip = (f) => {
    if (!f) return false;
    const byExt = f.name?.toLowerCase().endsWith(".zip");
    const byType = ["application/zip", "application/x-zip-compressed", "multipart/x-zip"].includes(f.type);
    return !!(byExt || byType);
  };

  const onDrop = useCallback((accepted) => {
    if (!accepted || accepted.length === 0) {
      onClear?.();
      return;
    }
    if (accepted.length === 1 && isZip(accepted[0]) && !accepted[0].webkitRelativePath) {
      onSelectZip?.(accepted[0]);
    } else {
      onSelectFolder?.(accepted);
    }
  }, [onSelectZip, onSelectFolder, onClear]);

  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDrop,
    multiple: true,
  });

  return (
    <div className={`uv-select-stage ${className}`} style={fullHeight ? undefined : {height: "auto"}}>
      <Card
        {...getRootProps()}
        className={
            `uv-dropzone p-4 text-center cursor-pointer border-dashed` +
            (marchingBorder ? "marching " : "") +
            (isDragActive ? "is-active bg-light " : "bg-white ")
        }
        style={fullHeight ? {flex: 1} : {}}
        >
        <input {...getInputProps()} />
        <div>
          <FontAwesomeIcon icon={faUpload} size="2x" className="mb-3 text-primary"/>
          <p className="mb-1">{isDragActive ? "Отпустите, чтобы загрузить" : title}</p>
          <p className="text-gray small mb-0">{subtitle}</p>
        </div>
      </Card>

      {/* Кнопки выбора */}
      <div className="d-flex gap-2 mt-2 mb-2">
        <Button size="sm" variant="outline-primary" onClick={() => zipInputRef.current?.click()}>
          Выбрать ZIP
        </Button>
        <input
          ref={zipInputRef}
          type="file"
          accept=".zip"
          style={{display:"none"}}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f && isZip(f)) onSelectZip?.(f);
            e.target.value = "";
          }}
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
          style={{display:"none"}}
          onChange={(e) => {
            const list = Array.from(e.target.files || []);
            if (list.length) onSelectFolder?.(list);
            e.target.value = "";
          }}
        />
      </div>

      {/* Превью выбранного */}
      {zipFile && (
        <Card className="mt-3">
          <Card.Body className="d-flex align-items-center">
            <FontAwesomeIcon icon={faFileArchive} className="me-3 text-secondary"/>
            <div className="flex-grow-1">
              <div className="fw-bold">{zipFile.name}</div>
              <div className="text-gray small">{formatBytes(zipFile.size)}</div>
            </div>
            <Button size="sm" variant="outline-danger" onClick={onClear}>
              <FontAwesomeIcon icon={faTimes}/>
            </Button>
          </Card.Body>
        </Card>
      )}

      {!zipFile && files?.length > 0 && (
        <Card className="mt-3">
          <Card.Body className="d-flex align-items-center">
            <div className="flex-grow-1">
              <div className="fw-bold">Выбрано файлов: {files.length}</div>
              <div className="text-gray small">
                пример пути: {files[0].webkitRelativePath || files[0].name}
              </div>
            </div>
            <Button size="sm" variant="outline-danger" onClick={onClear}>
              <FontAwesomeIcon icon={faTimes}/>
            </Button>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
