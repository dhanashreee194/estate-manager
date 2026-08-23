import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  createReport,
  saveDailySheet,
  updateReport,
} from "../../../api/report";
import { getVendors, type Vendor } from "../../../api/vendor";
import { getMaterials, getProjectStock } from "../../../api/inventory";
import { getProject } from "../../../api/project";
import "../projects.css";

const STEEL_SIZES = ["6 mm", "8 mm", "10 mm", "12 mm", "16 mm", "20 mm"];
const LABOUR_ROWS = 2;
const GOODS_ROWS = 2;
const PAYMENT_ROWS = 2;

type SheetTab = "site" | "labour" | "materials" | "payments" | "finish";

const SHEET_TABS: { id: SheetTab; label: string }[] = [
  { id: "site", label: "Site" },
  { id: "labour", label: "Labour" },
  { id: "materials", label: "Materials" },
  { id: "payments", label: "Pay / Goods" },
  { id: "finish", label: "Finish" },
];

type LabourRow = {
  vendorId: string;
  agency: string;
  skilled: number;
  men: number;
  women: number;
};

type PaymentRow = {
  vendorId: string;
  party: string;
  amount: number;
};

type GoodsRow = {
  materialId: string;
  material: string;
  quantity: number;
  remarks: string;
  vendorId: string;
};

type SteelRow = {
  size: string;
  stock: number;
  consumed: number;
  materialId: string;
};

const emptyLabour = (): LabourRow => ({
  vendorId: "",
  agency: "",
  skilled: 0,
  men: 0,
  women: 0,
});

const emptyPayment = (): PaymentRow => ({
  vendorId: "",
  party: "",
  amount: 0,
});

const emptyGoods = (): GoodsRow => ({
  materialId: "",
  material: "",
  quantity: 0,
  remarks: "",
  vendorId: "",
});

const defaultSteel = (): SteelRow[] =>
  STEEL_SIZES.map((size) => ({
    size,
    stock: 0,
    consumed: 0,
    materialId: "",
  }));

function matchSteelMaterial(materials: any[], size: string) {
  const needle = size.replace(/\s+/g, "").toLowerCase(); // "6mm"
  const steelish = materials.filter((m) =>
    /steel|tmt|bar/i.test(String(m.name || "")),
  );
  return (
    steelish.find((m) =>
      String(m.name || "")
        .replace(/\s+/g, "")
        .toLowerCase()
        .includes(needle),
    ) || null
  );
}

export default function DailyReportModal({
  projectId,
  report,
  onClose,
  onSaved,
}: any) {
  const outlet = useOutletContext<{ project?: { name?: string } } | null>();
  const isEdit = Boolean(report?.id);
  const [siteName, setSiteName] = useState("");
  const [date, setDate] = useState("");
  const [meterFrom, setMeterFrom] = useState<number | "">("");
  const [meterTo, setMeterTo] = useState<number | "">("");
  const [meterUnits, setMeterUnits] = useState<number | "">("");
  const [work, setWork] = useState("");
  const [checkedBy, setCheckedBy] = useState("");
  const [loading, setLoading] = useState(false);

  const [labours, setLabours] = useState<LabourRow[]>(
    Array.from({ length: LABOUR_ROWS }, emptyLabour),
  );
  const [cement, setCement] = useState({
    materialId: "",
    stock: 0,
    consumed: 0,
  });
  const [steel, setSteel] = useState<SteelRow[]>(defaultSteel());
  const [payments, setPayments] = useState<PaymentRow[]>([
    emptyPayment(),
    emptyPayment(),
    emptyPayment(),
  ]);
  const [goods, setGoods] = useState<GoodsRow[]>(
    Array.from({ length: GOODS_ROWS }, emptyGoods),
  );
  const [syncInventory, setSyncInventory] = useState(!isEdit);
  const [syncGoods, setSyncGoods] = useState(!isEdit);
  const [syncAttendance, setSyncAttendance] = useState(!isEdit);
  const [syncVendorPayments, setSyncVendorPayments] = useState(!isEdit);
  const [sheetTab, setSheetTab] = useState<SheetTab>("site");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [materialOptions, setMaterialOptions] = useState<any[]>([]);
  const [stockByMaterial, setStockByMaterial] = useState<
    Record<string, number>
  >({});

  const labourVendors = useMemo(
    () => vendors.filter((v) => v.type === "LABOUR" || v.type === "BOTH"),
    [vendors],
  );
  const materialVendors = useMemo(
    () => vendors.filter((v) => v.type === "MATERIAL" || v.type === "BOTH"),
    [vendors],
  );

  const cementBalance = Math.max(
    0,
    Number(cement.stock || 0) - Number(cement.consumed || 0),
  );

  const labourTotal = labours.reduce(
    (sum, row) =>
      sum +
      Number(row.skilled || 0) +
      Number(row.men || 0) +
      Number(row.women || 0),
    0,
  );

  useEffect(() => {
    getVendors().then(setVendors).catch(console.error);
    getMaterials().then(setMaterialOptions).catch(console.error);
    if (projectId) {
      getProject(projectId)
        .then((p) => {
          if (!report) setSiteName(p?.name || outlet?.project?.name || "");
        })
        .catch(() => {
          if (!report) setSiteName(outlet?.project?.name || "");
        });
      getProjectStock(projectId)
        .then((rows: any[]) => {
          const map: Record<string, number> = {};
          rows.forEach((r) => {
            map[r.materialId] = r.quantity;
          });
          setStockByMaterial(map);
        })
        .catch(console.error);
    }
  }, [projectId, report, outlet?.project?.name]);

  useEffect(() => {
    setSyncInventory(!isEdit);
    setSyncGoods(!isEdit);
    setSyncAttendance(!isEdit);
    setSyncVendorPayments(!isEdit);
  }, [isEdit]);

  useEffect(() => {
    if (!report) {
      setDate(new Date().toISOString().slice(0, 10));
      setMeterFrom("");
      setMeterTo("");
      setMeterUnits("");
      setWork("");
      setCheckedBy("");
      setLabours(Array.from({ length: LABOUR_ROWS }, emptyLabour));
      setCement({ materialId: "", stock: 0, consumed: 0 });
      setSteel(defaultSteel());
      setPayments(
        Array.from({ length: PAYMENT_ROWS }, emptyPayment),
      );
      setGoods(Array.from({ length: GOODS_ROWS }, emptyGoods));
      return;
    }

    setDate(report.date?.split("T")[0] || "");
    setSiteName(report.siteName || outlet?.project?.name || "");
    setMeterFrom(report.meterFrom ?? "");
    setMeterTo(report.meterTo ?? "");
    setMeterUnits(report.meterUnits ?? "");
    setWork(report.workDetails || "");
    setCheckedBy(report.checkedBy || "");

    const labourRows = (report.labours || []).map((l: any) => ({
      vendorId: l.vendorId || "",
      agency: l.agency || l.vendor?.name || "",
      skilled: l.skilled || 0,
      men: l.men || 0,
      women: l.women || 0,
    }));
    while (labourRows.length < LABOUR_ROWS) labourRows.push(emptyLabour());
    setLabours(labourRows);

    const cementRow =
      (report.materials || []).find(
        (m: any) =>
          !m.size &&
          String(m.material || "")
            .toLowerCase()
            .includes("cement"),
      ) || (report.materials || []).find((m: any) => !m.size);

    setCement({
      materialId: cementRow?.materialId || "",
      stock: cementRow?.stock || 0,
      consumed: cementRow?.consumed || 0,
    });

    const steelRows = (report.materials || []).filter((m: any) => m.size);
    setSteel(
      STEEL_SIZES.map((size) => {
        const found = steelRows.find((m: any) => m.size === size);
        return {
          size,
          stock: Number(found?.stock || 0),
          consumed: Number(found?.consumed || 0),
          materialId: found?.materialId || "",
        };
      }),
    );

    const paymentRows = (report.payments || []).map((p: any) => ({
      vendorId: p.vendorId || "",
      party: p.party || p.vendor?.name || "",
      amount: p.amount || 0,
    }));
    while (paymentRows.length < PAYMENT_ROWS) paymentRows.push(emptyPayment());
    setPayments(paymentRows);

    const goodsRows = (report.goods || []).map((g: any) => ({
      materialId: g.materialId || "",
      material: g.material || "",
      quantity: g.quantity || 0,
      remarks: g.remarks || "",
      vendorId: g.vendorId || "",
    }));
    while (goodsRows.length < GOODS_ROWS) goodsRows.push(emptyGoods());
    setGoods(goodsRows);
  }, [report, outlet?.project?.name]);

  // Auto-match steel material masters once loaded
  useEffect(() => {
    if (!materialOptions.length) return;
    setSteel((prev) =>
      prev.map((row) => {
        if (row.materialId) return row;
        const match = matchSteelMaterial(materialOptions, row.size);
        return match ? { ...row, materialId: match.id } : row;
      }),
    );
  }, [materialOptions]);

  useEffect(() => {
    if (
      meterFrom !== "" &&
      meterTo !== "" &&
      Number(meterTo) >= Number(meterFrom)
    ) {
      setMeterUnits(Number(meterTo) - Number(meterFrom));
    }
  }, [meterFrom, meterTo]);

  const cementOptions = materialOptions.filter((m) =>
    String(m.name || "")
      .toLowerCase()
      .includes("cement"),
  );

  const submit = async () => {
    if (!date) {
      alert("Please fill date");
      return;
    }
    if (!work.trim()) {
      alert("Please fill Works Details");
      return;
    }

    try {
      setLoading(true);
      let reportId = report?.id;

      const header = {
        date,
        workDetails: work,
        siteName,
        meterFrom: meterFrom === "" ? null : Number(meterFrom),
        meterTo: meterTo === "" ? null : Number(meterTo),
        meterUnits: meterUnits === "" ? null : Number(meterUnits),
        checkedBy,
      };

      if (report) {
        await updateReport(report.id, header);
      } else {
        const created = await createReport({
          projectId,
          ...header,
        });
        reportId = created.id;
      }

      if (!reportId) throw new Error("Report ID missing");

      const materials: any[] = [];
      if (cement.stock || cement.consumed || cement.materialId) {
        const cementName =
          materialOptions.find((m) => m.id === cement.materialId)?.name ||
          "Cement";
        materials.push({
          materialId: cement.materialId || undefined,
          material: cementName,
          size: null,
          stock: Number(cement.stock || 0),
          consumed: Number(cement.consumed || 0),
        });
      }
      steel.forEach((s) => {
        if (!s.stock && !s.consumed && !s.materialId) return;
        materials.push({
          materialId: s.materialId || undefined,
          material: `Steel ${s.size}`,
          size: s.size,
          stock: Number(s.stock || 0),
          consumed: Number(s.consumed || 0),
        });
      });

      await saveDailySheet(reportId, {
        ...header,
        labours: labours.filter(
          (l) => l.vendorId || l.agency || l.skilled || l.men || l.women,
        ),
        materials,
        payments: payments.filter((p) => p.party || p.vendorId || p.amount),
        goods: goods
          .filter((g) => g.material || g.materialId || g.quantity)
          .map((g) => ({
            materialId: g.materialId || undefined,
            material: g.material,
            quantity: Number(g.quantity || 0),
            remarks: g.remarks || undefined,
            vendorId: g.vendorId || undefined,
          })),
        syncInventory,
        syncGoods,
        syncAttendance,
        syncVendorPayments,
      });

      onSaved();
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to save daily report");
    } finally {
      setLoading(false);
    }
  };

  const updateLabour = (idx: number, patch: Partial<LabourRow>) => {
    const next = [...labours];
    next[idx] = { ...next[idx], ...patch };
    setLabours(next);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card daily-paper-modal">
        <div className="modal-header">
          <h3>Daily Report</h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="paper-sheet-tabs" role="tablist">
          {SHEET_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={sheetTab === tab.id}
              className={`paper-sheet-tab ${sheetTab === tab.id ? "active" : ""}`}
              onClick={() => setSheetTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="paper-sheet">
          <h2 className="paper-title">DAILY REPORT</h2>

          <section
            className={`paper-section ${sheetTab === "site" ? "active" : ""}`}
            data-section="site"
          >
            <div className="paper-header-row">
              <label>
                Site Name :
                <input
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                />
              </label>
              <label>
                Date :
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </label>
            </div>

            <div className="paper-meter-row">
              <span className="meter-label">Meter Reading</span>
              <label className="meter-field">
                From
                <input
                  type="number"
                  inputMode="numeric"
                  value={meterFrom}
                  onChange={(e) =>
                    setMeterFrom(e.target.value === "" ? "" : +e.target.value)
                  }
                />
              </label>
              <label className="meter-field">
                To
                <input
                  type="number"
                  inputMode="numeric"
                  value={meterTo}
                  onChange={(e) =>
                    setMeterTo(e.target.value === "" ? "" : +e.target.value)
                  }
                />
              </label>
              <label className="meter-field">
                Units
                <input
                  type="number"
                  inputMode="numeric"
                  value={meterUnits}
                  onChange={(e) =>
                    setMeterUnits(e.target.value === "" ? "" : +e.target.value)
                  }
                />
              </label>
            </div>

            <div className="paper-box">
              <div className="paper-box-title center">: Works Details :</div>
              <textarea
                className="paper-works"
                rows={4}
                placeholder={"1) Shuttering of Column and Stairs\n2) ..."}
                value={work}
                onChange={(e) => setWork(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="paper-next-btn"
              onClick={() => setSheetTab("labour")}
            >
              Next: Labour →
            </button>
          </section>

          <section
            className={`paper-section ${sheetTab === "labour" ? "active" : ""}`}
            data-section="labour"
          >
            <div className="paper-box">
              <div className="paper-box-title">Labour / Agency</div>
              <div className="paper-labour-list">
                {labours.map((row, idx) => {
                  const total =
                    Number(row.skilled || 0) +
                    Number(row.men || 0) +
                    Number(row.women || 0);
                  return (
                    <div className="paper-labour-card" key={idx}>
                      <div className="paper-labour-card-head">
                        <strong>Agency {idx + 1}</strong>
                        {labours.length > 1 && (
                          <button
                            type="button"
                            className="paper-row-remove"
                            onClick={() =>
                              setLabours(labours.filter((_, i) => i !== idx))
                            }
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <select
                        value={row.vendorId}
                        onChange={(e) => {
                          const vendorId = e.target.value;
                          const vendor = labourVendors.find(
                            (v) => v.id === vendorId,
                          );
                          updateLabour(idx, {
                            vendorId,
                            agency: vendor?.name || "",
                          });
                        }}
                      >
                        <option value="">Select vendor</option>
                        {labourVendors.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name}
                          </option>
                        ))}
                      </select>
                      <input
                        placeholder="Agency name"
                        value={row.agency}
                        onChange={(e) =>
                          updateLabour(idx, { agency: e.target.value })
                        }
                      />
                      <div className="paper-count-grid">
                        <label>
                          Skilled
                          <input
                            type="number"
                            inputMode="numeric"
                            value={row.skilled || ""}
                            onChange={(e) =>
                              updateLabour(idx, {
                                skilled: +e.target.value || 0,
                              })
                            }
                          />
                        </label>
                        <label>
                          Men
                          <input
                            type="number"
                            inputMode="numeric"
                            value={row.men || ""}
                            onChange={(e) =>
                              updateLabour(idx, { men: +e.target.value || 0 })
                            }
                          />
                        </label>
                        <label>
                          Women
                          <input
                            type="number"
                            inputMode="numeric"
                            value={row.women || ""}
                            onChange={(e) =>
                              updateLabour(idx, {
                                women: +e.target.value || 0,
                              })
                            }
                          />
                        </label>
                        <label>
                          Total
                          <input value={total || ""} disabled />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop table (hidden on small screens via CSS) */}
              <table className="paper-table paper-desktop-table">
                <thead>
                  <tr>
                    <th>Name of Agency</th>
                    <th>Skilled</th>
                    <th>Men</th>
                    <th>Women</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {labours.map((row, idx) => {
                    const total =
                      Number(row.skilled || 0) +
                      Number(row.men || 0) +
                      Number(row.women || 0);
                    return (
                      <tr key={idx}>
                        <td>
                          <select
                            value={row.vendorId}
                            onChange={(e) => {
                              const vendorId = e.target.value;
                              const vendor = labourVendors.find(
                                (v) => v.id === vendorId,
                              );
                              updateLabour(idx, {
                                vendorId,
                                agency: vendor?.name || "",
                              });
                            }}
                          >
                            <option value="">Select / type →</option>
                            {labourVendors.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.name}
                              </option>
                            ))}
                          </select>
                          <input
                            placeholder="Agency name"
                            value={row.agency}
                            onChange={(e) =>
                              updateLabour(idx, { agency: e.target.value })
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={row.skilled || ""}
                            onChange={(e) =>
                              updateLabour(idx, {
                                skilled: +e.target.value || 0,
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={row.men || ""}
                            onChange={(e) =>
                              updateLabour(idx, { men: +e.target.value || 0 })
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={row.women || ""}
                            onChange={(e) =>
                              updateLabour(idx, {
                                women: +e.target.value || 0,
                              })
                            }
                          />
                        </td>
                        <td>
                          <input value={total || ""} disabled />
                        </td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td
                      colSpan={4}
                      style={{ textAlign: "right", fontWeight: 600 }}
                    >
                      Total
                    </td>
                    <td>
                      <input value={labourTotal || ""} disabled />
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="paper-row-actions">
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => setLabours([...labours, emptyLabour()])}
                >
                  + Add agency
                </button>
                <span className="paper-total-chip">
                  Workers today: <strong>{labourTotal}</strong>
                </span>
              </div>
            </div>
            <div className="paper-section-nav">
              <button type="button" onClick={() => setSheetTab("site")}>
                ← Site
              </button>
              <button
                type="button"
                className="paper-next-btn"
                onClick={() => setSheetTab("materials")}
              >
                Next: Materials →
              </button>
            </div>
          </section>

          <section
            className={`paper-section ${sheetTab === "materials" ? "active" : ""}`}
            data-section="materials"
          >
            <div className="paper-top-grid">
              <div className="paper-box">
                <div className="paper-box-title">CEMENT CONSUMPTION</div>
                <select
                  value={cement.materialId}
                  onChange={(e) => {
                    const materialId = e.target.value;
                    setCement({
                      ...cement,
                      materialId,
                      stock: stockByMaterial[materialId] ?? cement.stock,
                    });
                  }}
                >
                  <option value="">Link inventory cement (optional)</option>
                  {(cementOptions.length ? cementOptions : materialOptions).map(
                    (m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                        {stockByMaterial[m.id] != null
                          ? ` · stock ${stockByMaterial[m.id]}`
                          : ""}
                      </option>
                    ),
                  )}
                </select>
                <div className="paper-count-grid cement-grid">
                  <label>
                    Stock
                    <input
                      type="number"
                      inputMode="numeric"
                      value={cement.stock || ""}
                      onChange={(e) =>
                        setCement({
                          ...cement,
                          stock: +e.target.value || 0,
                        })
                      }
                    />
                    <small>Bags</small>
                  </label>
                  <label>
                    Used
                    <input
                      type="number"
                      inputMode="numeric"
                      value={cement.consumed || ""}
                      onChange={(e) =>
                        setCement({
                          ...cement,
                          consumed: +e.target.value || 0,
                        })
                      }
                    />
                    <small>Bags</small>
                  </label>
                  <label>
                    Balance
                    <input value={cementBalance || ""} disabled />
                    <small>Bags</small>
                  </label>
                </div>
              </div>

              <div className="paper-box">
                <div className="paper-box-title">Steel Stock / Used</div>
                <div className="paper-steel-grid">
                  {steel.map((row, idx) => (
                    <div className="paper-steel-card" key={row.size}>
                      <strong>{row.size}</strong>
                      <label>
                        Stock
                        <input
                          type="number"
                          inputMode="numeric"
                          value={row.stock || ""}
                          onChange={(e) => {
                            const next = [...steel];
                            next[idx] = {
                              ...row,
                              stock: +e.target.value || 0,
                            };
                            setSteel(next);
                          }}
                        />
                      </label>
                      <label>
                        Used
                        <input
                          type="number"
                          inputMode="numeric"
                          value={row.consumed || ""}
                          onChange={(e) => {
                            const next = [...steel];
                            next[idx] = {
                              ...row,
                              consumed: +e.target.value || 0,
                            };
                            setSteel(next);
                          }}
                        />
                      </label>
                      <select
                        value={row.materialId}
                        onChange={(e) => {
                          const materialId = e.target.value;
                          const next = [...steel];
                          next[idx] = {
                            ...row,
                            materialId,
                            stock: stockByMaterial[materialId] ?? row.stock,
                          };
                          setSteel(next);
                        }}
                      >
                        <option value="">Link material</option>
                        {materialOptions.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="paper-section-nav">
              <button type="button" onClick={() => setSheetTab("labour")}>
                ← Labour
              </button>
              <button
                type="button"
                className="paper-next-btn"
                onClick={() => setSheetTab("payments")}
              >
                Next: Pay / Goods →
              </button>
            </div>
          </section>

          <section
            className={`paper-section ${sheetTab === "payments" ? "active" : ""}`}
            data-section="payments"
          >
            <div className="paper-box">
              <div className="paper-box-title">Payment</div>
              <div className="paper-labour-list">
                {payments.map((row, idx) => (
                  <div className="paper-labour-card" key={idx}>
                    <div className="paper-labour-card-head">
                      <strong>Payment {idx + 1}</strong>
                      {payments.length > 1 && (
                        <button
                          type="button"
                          className="paper-row-remove"
                          onClick={() =>
                            setPayments(payments.filter((_, i) => i !== idx))
                          }
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <select
                      value={row.vendorId}
                      onChange={(e) => {
                        const vendorId = e.target.value;
                        const vendor = vendors.find((v) => v.id === vendorId);
                        const next = [...payments];
                        next[idx] = {
                          ...row,
                          vendorId,
                          party: vendor?.name || "",
                        };
                        setPayments(next);
                      }}
                    >
                      <option value="">Select vendor</option>
                      {vendors.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                    <input
                      placeholder="e.g. Raju R.C.C"
                      value={row.party}
                      onChange={(e) => {
                        const next = [...payments];
                        next[idx] = { ...row, party: e.target.value };
                        setPayments(next);
                      }}
                    />
                    <label>
                      Amount (₹)
                      <input
                        type="number"
                        inputMode="numeric"
                        value={row.amount || ""}
                        onChange={(e) => {
                          const next = [...payments];
                          next[idx] = {
                            ...row,
                            amount: +e.target.value || 0,
                          };
                          setPayments(next);
                        }}
                      />
                    </label>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setPayments([...payments, emptyPayment()])}
              >
                + Add payment
              </button>
            </div>

            <div className="paper-box">
              <div className="paper-box-title">Goods Received</div>
              <div className="paper-labour-list">
                {goods.map((row, idx) => (
                  <div className="paper-labour-card" key={idx}>
                    <div className="paper-labour-card-head">
                      <strong>Item {idx + 1}</strong>
                      {goods.length > 1 && (
                        <button
                          type="button"
                          className="paper-row-remove"
                          onClick={() =>
                            setGoods(goods.filter((_, i) => i !== idx))
                          }
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <select
                      value={row.materialId}
                      onChange={(e) => {
                        const materialId = e.target.value;
                        const mat = materialOptions.find(
                          (m) => m.id === materialId,
                        );
                        const next = [...goods];
                        next[idx] = {
                          ...row,
                          materialId,
                          material: mat?.name || row.material,
                        };
                        setGoods(next);
                      }}
                    >
                      <option value="">Select material</option>
                      {materialOptions.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                    <input
                      placeholder="Material details"
                      value={row.material}
                      onChange={(e) => {
                        const next = [...goods];
                        next[idx] = { ...row, material: e.target.value };
                        setGoods(next);
                      }}
                    />
                    <div className="paper-count-grid">
                      <label>
                        Qty
                        <input
                          type="number"
                          inputMode="numeric"
                          value={row.quantity || ""}
                          onChange={(e) => {
                            const next = [...goods];
                            next[idx] = {
                              ...row,
                              quantity: +e.target.value || 0,
                            };
                            setGoods(next);
                          }}
                        />
                      </label>
                      <label>
                        Vendor
                        <select
                          value={row.vendorId}
                          onChange={(e) => {
                            const next = [...goods];
                            next[idx] = { ...row, vendorId: e.target.value };
                            setGoods(next);
                          }}
                        >
                          <option value="">—</option>
                          {materialVendors.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <input
                      placeholder="Remarks"
                      value={row.remarks}
                      onChange={(e) => {
                        const next = [...goods];
                        next[idx] = { ...row, remarks: e.target.value };
                        setGoods(next);
                      }}
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setGoods([...goods, emptyGoods()])}
              >
                + Add goods row
              </button>
            </div>
            <div className="paper-section-nav">
              <button type="button" onClick={() => setSheetTab("materials")}>
                ← Materials
              </button>
              <button
                type="button"
                className="paper-next-btn"
                onClick={() => setSheetTab("finish")}
              >
                Next: Finish →
              </button>
            </div>
          </section>

          <section
            className={`paper-section ${sheetTab === "finish" ? "active" : ""}`}
            data-section="finish"
          >
            <div className="paper-footer-row sync-grid">
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={syncInventory}
                  onChange={(e) => setSyncInventory(e.target.checked)}
                />
                Deduct cement / steel used from inventory
              </label>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={syncGoods}
                  onChange={(e) => setSyncGoods(e.target.checked)}
                />
                Add goods received to inventory
              </label>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={syncAttendance}
                  onChange={(e) => setSyncAttendance(e.target.checked)}
                />
                Mark agency labour present (assigned workers)
              </label>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={syncVendorPayments}
                  onChange={(e) => setSyncVendorPayments(e.target.checked)}
                />
                Post payments as vendor expenses
              </label>
              {isEdit && (
                <p className="sync-hint">
                  Editing an existing sheet — syncs are off by default to avoid
                  double-posting. Re-enable only if you need to push again.
                </p>
              )}
              <label>
                Reports Checked By :
                <input
                  value={checkedBy}
                  onChange={(e) => setCheckedBy(e.target.value)}
                  placeholder="Name / sign"
                />
              </label>
            </div>
            <div className="paper-section-nav">
              <button type="button" onClick={() => setSheetTab("payments")}>
                ← Pay / Goods
              </button>
            </div>
          </section>
        </div>

        <div className="modal-actions paper-sticky-actions">
          <button onClick={onClose}>Cancel</button>
          <button disabled={loading} className="primary-btn" onClick={submit}>
            {loading ? "Saving..." : "Save Daily Report"}
          </button>
        </div>
      </div>
    </div>
  );
}
