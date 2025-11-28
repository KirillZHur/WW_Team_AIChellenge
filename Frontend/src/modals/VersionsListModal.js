// src/modals/VersionsListModal.js
import { Modal, Table, Button, Badge, Pagination, Spinner, Alert } from "@themesberg/react-bootstrap";
import api from "../api";
import { useEffect, useState } from "react";

export default function VersionsListModal({ show, onHide, product, onPickVersion, refreshKey }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [data, setData] = useState({
    content: [],
    page: 0,
    size: 10,
    totalPages: 1,
    totalElements: 0,
    first: true,
    last: true,
  });

  const load = (p = 0) => {
    if (!product?.id) return;
    setLoading(true); setError(null);
    api.get(`/versions/${product.id}/list`, { params: { page: p } })
      .then(({ data }) => setData(data))
      .catch((err) => setError(err?.response?.data?.message || err.message || "Ошибка загрузки"))
      .finally(() => setLoading(false));
  };

  // грузим при открытии/смене изделия/тике refreshKey
  useEffect(() => {
    if (show && product?.id) {
      setPage(0);
      load(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, product?.id, refreshKey]);

  const goto = (p) => { setPage(p); load(p); };

  return (
    <Modal as="div" size="lg" centered show={show} onHide={onHide}>
      <Modal.Header>
        <Modal.Title className="h6">Версии — {product?.name || "—"}</Modal.Title>
        <button className="btn-close" aria-label="Close" onClick={onHide} />
      </Modal.Header>

      <Modal.Body>
        {loading && <div className="py-3 text-center"><Spinner animation="border" size="sm" /> Загрузка…</div>}
        {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

        {!loading && !error && data.content?.length === 0 && (
          <div className="text-muted">Версий не найдено.</div>
        )}

        {!loading && !error && data.content?.length > 0 && (
          <>
            <Table hover responsive className="align-middle mb-3">
              <thead className="table-light">
                <tr>
                  <th style={{width: 120}}>Версия</th>
                  <th>Комментарий</th>
                  <th style={{width: 220}}>Автор / Дата</th>
                  <th style={{width: 140}} className="text-end">Действия</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map(v => (
                  <tr key={v.id}>
                    <td>
                      <Badge bg="primary" className="fs-6">v{v.semver}</Badge>
                    </td>
                    <td>
                      <div className="fw-semibold">{v.comment || "без комментария"}</div>
                      {v.preview && <div className="text-muted small">preview</div>}
                    </td>
                    <td>
                      <div className="small">{v.createdBy?.fullName ?? v.createdBy?.username ?? "—"}</div>
                      <div className="text-muted small">
                        {v.createdAt ? new Date(v.createdAt).toLocaleString() : "—"}
                      </div>
                    </td>
                    <td className="text-end">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => { onPickVersion?.(v); onHide?.(); }}
                        title="Показать эту версию в дереве"
                      >
                        Показать
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {data.totalPages > 1 && (
              <div className="d-flex justify-content-center">
                <Pagination className="mb-0">
                  <Pagination.First disabled={data.first} onClick={() => goto(0)} />
                  <Pagination.Prev disabled={data.first} onClick={() => goto(page - 1)} />
                  <Pagination.Item active>{page + 1}</Pagination.Item>
                  <Pagination.Next disabled={data.last} onClick={() => goto(page + 1)} />
                  <Pagination.Last disabled={data.last} onClick={() => goto(data.totalPages - 1)} />
                </Pagination>
              </div>
            )}
          </>
        )}
      </Modal.Body>
    </Modal>
  );
}
