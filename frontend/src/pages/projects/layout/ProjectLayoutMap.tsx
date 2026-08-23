import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  autoArrangeLayout,
  clearLayoutImage,
  getProjectLayout,
  placeUnitOnLayout,
  updateLayoutConfig,
  updateUnitStatus,
  uploadLayoutImage,
  type LayoutMapResponse,
  type LayoutUnit,
} from "../../../api/layout";
import { API_BASE } from "../../../api/baseUrl";
import "./layout-map.css";


const STATUS_CLASS: Record<string, string> = {
  AVAILABLE: "st-available",
  HOLD: "st-hold",
  BOOKED: "st-booked",
  SOLD: "st-sold",
  CANCELLED: "st-cancelled",
};

type ViewMode = "site" | "building";

function mediaUrl(path?: string | null) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}

export default function ProjectLayoutMap() {
  const { t } = useTranslation();
  const { projectId } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<LayoutMapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState<ViewMode>("site");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [selected, setSelected] = useState<LayoutUnit | null>(null);
  const [placingUnitId, setPlacingUnitId] = useState<string | null>(null);
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(10);
  const [busy, setBusy] = useState(false);
  const [planOpacity, setPlanOpacity] = useState(0.55);

  const load = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError("");
      const res = await getProjectLayout(projectId);
      setData(res);
      setRows(res.project.layoutRows);
      setCols(res.project.layoutCols);
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.message || t("common.failed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [projectId]);

  const visibleUnits = useMemo(() => {
    if (!data) return [];
    return data.units.filter((u) =>
      filterType === "ALL" ? true : u.unitType === filterType,
    );
  }, [data, filterType]);

  const cellMap = useMemo(() => {
    const map = new Map<string, LayoutUnit>();
    visibleUnits.forEach((u) => {
      if (u.layoutRow != null && u.layoutCol != null) {
        map.set(`${u.layoutRow}:${u.layoutCol}`, u);
      }
    });
    return map;
  }, [visibleUnits]);

  const unplaced = useMemo(
    () => visibleUnits.filter((u) => u.layoutRow == null || u.layoutCol == null),
    [visibleUnits],
  );

  const buildingGroups = useMemo(() => {
    const flats = visibleUnits.filter((u) => u.unitType === "FLAT");
    const groups: Record<string, LayoutUnit[]> = {};
    flats.forEach((u) => {
      const key = `${u.buildingName || "Building"} / ${u.wingName || "Wing"}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(u);
    });
    return groups;
  }, [visibleUnits]);

  const onCellClick = async (r: number, c: number) => {
    const existing = cellMap.get(`${r}:${c}`);
    if (placingUnitId) {
      try {
        setBusy(true);
        await placeUnitOnLayout(placingUnitId, {
          layoutRow: r,
          layoutCol: c,
        });
        setPlacingUnitId(null);
        await load();
      } catch (e: any) {
        alert(e?.response?.data?.message || "Could not place unit");
      } finally {
        setBusy(false);
      }
      return;
    }
    if (existing) setSelected(existing);
  };

  const saveGridSize = async () => {
    if (!projectId) return;
    try {
      setBusy(true);
      await updateLayoutConfig(projectId, {
        layoutRows: Number(rows),
        layoutCols: Number(cols),
      });
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.message || "Failed to save grid size");
    } finally {
      setBusy(false);
    }
  };

  const onUploadPlan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !projectId) return;
    try {
      setBusy(true);
      await uploadLayoutImage(projectId, file);
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to upload site plan");
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onRemovePlan = async () => {
    if (!projectId) return;
    if (!confirm(t("projects.removePlan") + "?")) return;
    try {
      setBusy(true);
      await clearLayoutImage(projectId);
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to remove site plan");
    } finally {
      setBusy(false);
    }
  };

  const runAutoArrange = async () => {
    if (!projectId) return;
    if (!confirm("Place all unassigned units onto free grid cells?")) return;
    try {
      setBusy(true);
      const res = await autoArrangeLayout(projectId);
      setData(res);
      setRows(res.project.layoutRows);
      setCols(res.project.layoutCols);
    } catch (e: any) {
      alert(e?.response?.data?.message || "Auto-arrange failed");
    } finally {
      setBusy(false);
    }
  };

  const setStatus = async (status: LayoutUnit["status"]) => {
    if (!selected) return;
    try {
      setBusy(true);
      await updateUnitStatus(selected.id, status);
      await load();
      setSelected({ ...selected, status });
    } catch (e: any) {
      alert(e?.response?.data?.message || "Failed to update status");
    } finally {
      setBusy(false);
    }
  };

  const clearPlacement = async () => {
    if (!selected) return;
    try {
      setBusy(true);
      await placeUnitOnLayout(selected.id, {
        layoutRow: null,
        layoutCol: null,
      });
      setSelected(null);
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.message || "Failed to clear placement");
    } finally {
      setBusy(false);
    }
  };

  const statusClass = (status: string) =>
    STATUS_CLASS[status] || STATUS_CLASS.AVAILABLE;

  const statusLabel = (status: string) =>
    t(`status.${status}`, { defaultValue: status });

  if (loading) return <div className="layout-map-page">{t("projects.loadingLayout")}</div>;
  if (error) return <div className="layout-map-page error">{error}</div>;
  if (!data) return null;

  const summary = data.summary;
  const planUrl = mediaUrl(data.project.layoutImageUrl);
  const hasPlan = Boolean(planUrl);

  return (
    <div className="layout-map-page">
      <div className="layout-header">
        <div>
          <h3>{t("projects.layoutTitle")}</h3>
          <p className="sub">{t("projects.legendHint")}</p>
        </div>
        <div className="layout-actions">
          <div className="view-toggle">
            <button
              className={view === "site" ? "active" : ""}
              onClick={() => setView("site")}
            >
              {t("projects.siteGrid")}
            </button>
            <button
              className={view === "building" ? "active" : ""}
              onClick={() => setView("building")}
            >
              {t("projects.buildingFloors")}
            </button>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="ALL">{t("vendors.allTypes")}</option>
            <option value="PLOT">{t("projects.plots")}</option>
            <option value="FLAT">{t("projects.flats")}</option>
            <option value="VILLA">{t("reports.villas")}</option>
            <option value="ROW_HOUSE">{t("projects.buildings")}</option>
          </select>
          <button disabled={busy} onClick={runAutoArrange}>
            {t("projects.autoArrange")}
          </button>
        </div>
      </div>

      <div className="layout-summary">
        {Object.entries(STATUS_CLASS).map(([key, className]) => (
          <div key={key} className={`summary-pill ${className}`}>
            <span className="dot" />
            <span>{statusLabel(key)}</span>
            <strong>{summary[key] || 0}</strong>
          </div>
        ))}
        <div className="summary-pill st-total">
          <span>{t("common.total")}</span>
          <strong>{summary.TOTAL || 0}</strong>
        </div>
      </div>

      <div className="layout-body">
        <div className="layout-main">
          {view === "site" ? (
            <>
              <div className="grid-config">
                <label>
                  {t("projects.rows")}
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={rows}
                    onChange={(e) => setRows(+e.target.value)}
                  />
                </label>
                <label>
                  {t("projects.cols")}
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={cols}
                    onChange={(e) => setCols(+e.target.value)}
                  />
                </label>
                <button disabled={busy} onClick={saveGridSize}>
                  {t("projects.saveGrid")}
                </button>

                <div className="plan-upload">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={onUploadPlan}
                  />
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {hasPlan
                      ? `${t("common.upload")} ${t("projects.sitePlan")}`
                      : `${t("common.upload")} ${t("projects.sitePlan")}`}
                  </button>
                  {hasPlan && (
                    <button
                      type="button"
                      className="danger-btn"
                      disabled={busy}
                      onClick={onRemovePlan}
                    >
                      {t("projects.removePlan")}
                    </button>
                  )}
                </div>

                {hasPlan && (
                  <label className="opacity-label">
                    {t("projects.sitePlan")}
                    <input
                      type="range"
                      min={0.15}
                      max={1}
                      step={0.05}
                      value={planOpacity}
                      onChange={(e) => setPlanOpacity(+e.target.value)}
                    />
                  </label>
                )}

                {placingUnitId && (
                  <span className="placing-hint">
                    {t("nav.units")}…
                    <button onClick={() => setPlacingUnitId(null)}>{t("common.cancel")}</button>
                  </span>
                )}
              </div>

              <div
                className={`site-grid-wrap ${hasPlan ? "has-plan" : ""}`}
                style={
                  hasPlan
                    ? ({
                        backgroundImage: `url(${planUrl})`,
                        ["--plan-dim" as string]: String(1 - planOpacity),
                      } as React.CSSProperties)
                    : undefined
                }
              >
                <div
                  className="site-grid"
                  style={{
                    gridTemplateColumns: `repeat(${cols}, minmax(56px, 1fr))`,
                  }}
                >
                  {Array.from({ length: rows }).map((_, r) =>
                    Array.from({ length: cols }).map((__, c) => {
                      const unit = cellMap.get(`${r}:${c}`);
                      const cellStatusClass = unit
                        ? statusClass(unit.status)
                        : null;
                      return (
                        <button
                          key={`${r}-${c}`}
                          type="button"
                          className={`site-cell ${unit ? cellStatusClass : "empty"} ${
                            selected?.id === unit?.id ? "selected" : ""
                          }`}
                          onClick={() => onCellClick(r, c)}
                          title={
                            unit
                              ? `${unit.unitNumber} · ${statusLabel(unit.status)}`
                              : `${r + 1},${c + 1}`
                          }
                        >
                          {unit ? (
                            <>
                              <span className="cell-no">{unit.unitNumber}</span>
                              <span className="cell-st">{statusLabel(unit.status)}</span>
                            </>
                          ) : (
                            <span className="cell-empty">·</span>
                          )}
                        </button>
                      );
                    }),
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="building-view">
              {Object.keys(buildingGroups).length === 0 && (
                <p className="muted">{t("common.noData")}</p>
              )}
              {Object.entries(buildingGroups).map(([group, units]) => {
                const byFloor: Record<string, LayoutUnit[]> = {};
                units.forEach((u) => {
                  const f = String(u.floor ?? "?");
                  if (!byFloor[f]) byFloor[f] = [];
                  byFloor[f].push(u);
                });
                const floors = Object.keys(byFloor).sort((a, b) => {
                  if (a === "?" || b === "?") return 0;
                  return Number(b) - Number(a);
                });
                return (
                  <div key={group} className="building-block">
                    <h4>{group}</h4>
                    {floors.map((floor) => (
                      <div key={floor} className="floor-row">
                        <div className="floor-label">{t("projects.floors")} {floor}</div>
                        <div className="floor-units">
                          {byFloor[floor]
                            .sort((a, b) =>
                              a.unitNumber.localeCompare(b.unitNumber),
                            )
                            .map((u) => {
                              const chipClass = statusClass(u.status);
                              return (
                                <button
                                  key={u.id}
                                  type="button"
                                  className={`flat-chip ${chipClass} ${
                                    selected?.id === u.id ? "selected" : ""
                                  }`}
                                  onClick={() => setSelected(u)}
                                >
                                  {u.unitNumber}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <aside className="layout-side">
          <div className="legend cardish">
            <h4>{t("projects.legend")}</h4>
            {Object.entries(STATUS_CLASS).map(([key, className]) => (
              <div key={key} className="legend-row">
                <span className={`swatch ${className}`} />
                {statusLabel(key)}
              </div>
            ))}
          </div>

          {hasPlan && (
            <div className="cardish plan-preview">
              <h4>{t("projects.sitePlan")}</h4>
              <img src={planUrl} alt={t("projects.sitePlan")} />
            </div>
          )}

          <div className="cardish">
            <h4>{t("nav.units")} ({unplaced.length})</h4>
            <div className="unplaced-list">
              {unplaced.length === 0 && (
                <p className="muted">{t("common.noData")}</p>
              )}
              {unplaced.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  className={`unplaced-item ${statusClass(u.status)}`}
                  onClick={() => {
                    setSelected(u);
                    setPlacingUnitId(u.id);
                    setView("site");
                  }}
                >
                  {u.unitNumber}
                  <span>{u.unitType}</span>
                </button>
              ))}
            </div>
          </div>

          {selected && (
            <div className="cardish selected-panel">
              <h4>{t("nav.units")} {selected.unitNumber}</h4>
              <p>
                <b>{t("common.type")}:</b> {selected.unitType}
              </p>
              <p>
                <b>{t("common.status")}:</b> {statusLabel(selected.status)}
              </p>
              <p>
                <b>{t("common.total")}:</b> {selected.areaSqFt} sq.ft
              </p>
              <p>
                <b>{t("common.amount")}:</b> ₹{" "}
                {selected.basePrice?.toLocaleString?.() ?? selected.basePrice}
              </p>
              {(selected.buildingName || selected.wingName) && (
                <p>
                  <b>{t("createProject.location")}:</b>{" "}
                  {[selected.buildingName, selected.wingName]
                    .filter(Boolean)
                    .join(" / ")}
                  {selected.floor != null ? ` · ${t("projects.floors")} ${selected.floor}` : ""}
                </p>
              )}
              {selected.booking && (
                <p>
                  <b>{t("common.customer")}:</b> {selected.booking.customerName || "—"}
                  {selected.booking.customerPhone
                    ? ` (${selected.booking.customerPhone})`
                    : ""}
                </p>
              )}
              <div className="status-actions">
                <button disabled={busy} onClick={() => setStatus("AVAILABLE")}>
                  {t("status.AVAILABLE")}
                </button>
                <button disabled={busy} onClick={() => setStatus("HOLD")}>
                  {t("status.HOLD")}
                </button>
                <button disabled={busy} onClick={() => setStatus("BOOKED")}>
                  {t("status.BOOKED")}
                </button>
                <button disabled={busy} onClick={() => setStatus("SOLD")}>
                  {t("status.SOLD")}
                </button>
              </div>
              <div className="panel-actions">
                <button
                  onClick={() => {
                    setPlacingUnitId(selected.id);
                    setView("site");
                  }}
                >
                  {t("common.edit")}
                </button>
                <button onClick={clearPlacement}>{t("projects.removeFromMap")}</button>
                <button onClick={() => setSelected(null)}>{t("common.close")}</button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
