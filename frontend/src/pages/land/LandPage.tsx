import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  addParcelPartner,
  createLandParcel,
  createLandPartner,
  createLandPayment,
  deactivateLandPartner,
  getLandParcels,
  getLandPartners,
  getLandPayments,
  getLandSummary,
  removeParcelPartner,
  updateLandParcel,
  type LandParcel,
  type LandPartner,
} from "../../api/land";
import { getBankAccounts } from "../../api/finance";
import { getProjects } from "../../api/project";
import "./land.css";

const ACQUISITION_TYPES = [
  { value: "OUTRIGHT", labelKey: "land.outright" },
  { value: "JV", labelKey: "land.jv" },
  { value: "DEVELOPMENT_AGREEMENT", labelKey: "land.da" },
  { value: "OTHER", labelKey: "bookings.other" },
];

const STATUSES = [
  "PROSPECT",
  "UNDER_NEGOTIATION",
  "AGREED",
  "REGISTERED",
  "LINKED_TO_PROJECT",
  "CANCELLED",
];

const ROLES = ["LANDOWNER", "INVESTOR", "DEVELOPER", "OTHER"];

const emptyPartner = {
  name: "",
  phone: "",
  panNumber: "",
  address: "",
};

const emptyParcel = {
  name: "",
  surveyNumber: "",
  gatNumber: "",
  village: "",
  taluka: "",
  district: "",
  areaAcres: "" as number | "",
  areaSqFt: "" as number | "",
  acquisitionType: "OUTRIGHT",
  status: "PROSPECT",
  purchasePrice: "" as number | "",
  agreementDate: "",
  registrationDate: "",
  projectId: "",
  notes: "",
};

const emptyPayment = {
  landParcelId: "",
  partnerId: "",
  amount: "" as number | "",
  date: new Date().toISOString().slice(0, 10),
  description: "",
  reference: "",
  bankAccountId: "",
};

const emptyShare = {
  parcelId: "",
  partnerId: "",
  role: "LANDOWNER",
  sharePercent: "" as number | "",
};

export default function LandPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [partnerForm, setPartnerForm] = useState(emptyPartner);
  const [parcelForm, setParcelForm] = useState(emptyParcel);
  const [paymentForm, setPaymentForm] = useState(emptyPayment);
  const [shareForm, setShareForm] = useState(emptyShare);
  const [statusFilter, setStatusFilter] = useState("");

  const { data: summary } = useQuery({
    queryKey: ["land-summary"],
    queryFn: getLandSummary,
  });

  const { data: partners = [] } = useQuery({
    queryKey: ["land-partners"],
    queryFn: () => getLandPartners(),
  });

  const { data: parcels = [], isLoading } = useQuery({
    queryKey: ["land-parcels", statusFilter],
    queryFn: () =>
      getLandParcels(statusFilter ? { status: statusFilter } : undefined),
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["land-payments"],
    queryFn: () => getLandPayments(),
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["bank-accounts"],
    queryFn: () => getBankAccounts(),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["land-summary"] });
    qc.invalidateQueries({ queryKey: ["land-partners"] });
    qc.invalidateQueries({ queryKey: ["land-parcels"] });
    qc.invalidateQueries({ queryKey: ["land-payments"] });
    qc.invalidateQueries({ queryKey: ["cashbook"] });
    qc.invalidateQueries({ queryKey: ["finance-summary"] });
    qc.invalidateQueries({ queryKey: ["bank-accounts"] });
  };

  const createPartnerMut = useMutation({
    mutationFn: createLandPartner,
    onSuccess: () => {
      setPartnerForm(emptyPartner);
      invalidate();
    },
  });

  const deactivatePartnerMut = useMutation({
    mutationFn: deactivateLandPartner,
    onSuccess: invalidate,
  });

  const createParcelMut = useMutation({
    mutationFn: createLandParcel,
    onSuccess: () => {
      setParcelForm(emptyParcel);
      invalidate();
    },
  });

  const updateParcelMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateLandParcel(id, data),
    onSuccess: invalidate,
  });

  const addShareMut = useMutation({
    mutationFn: () =>
      addParcelPartner(shareForm.parcelId, {
        partnerId: shareForm.partnerId,
        role: shareForm.role,
        sharePercent:
          shareForm.sharePercent === ""
            ? undefined
            : Number(shareForm.sharePercent),
      }),
    onSuccess: () => {
      setShareForm(emptyShare);
      invalidate();
    },
  });

  const removeShareMut = useMutation({
    mutationFn: ({
      parcelId,
      shareId,
    }: {
      parcelId: string;
      shareId: string;
    }) => removeParcelPartner(parcelId, shareId),
    onSuccess: invalidate,
  });

  const payMut = useMutation({
    mutationFn: createLandPayment,
    onSuccess: () => {
      setPaymentForm({
        ...emptyPayment,
        date: new Date().toISOString().slice(0, 10),
      });
      invalidate();
    },
  });

  const fmt = (n: number) =>
    `₹ ${(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  const statusLabel = (s: string) =>
    t(`status.${s}`, { defaultValue: s.replace(/_/g, " ") });

  const selectedParcel = useMemo(
    () => parcels.find((p) => p.id === shareForm.parcelId),
    [parcels, shareForm.parcelId],
  );

  return (
    <div className="land-page">
      <div className="land-summary">
        <div className="summary-card">
          <h4>{t("land.parcels")}</h4>
          <p>{summary?.parcelCount || 0}</p>
        </div>
        <div className="summary-card">
          <h4>{t("land.purchaseValue")}</h4>
          <p>{fmt(summary?.totalPurchase || 0)}</p>
        </div>
        <div className="summary-card">
          <h4>{t("common.paid")}</h4>
          <p>{fmt(summary?.totalPaid || 0)}</p>
        </div>
        <div className="summary-card">
          <h4>{t("common.balance")}</h4>
          <p>{fmt(summary?.balance || 0)}</p>
        </div>
        <div className="summary-card">
          <h4>{t("land.jv")} / {t("land.da")}</h4>
          <p>{summary?.jvCount || 0}</p>
        </div>
      </div>

      <div className="land-grid">
        <div className="page-card">
          <h3>{t("land.partners")}</h3>
          <p className="hint">{t("land.partnersHint")}</p>
          <div className="form-row wrap">
            <input
              placeholder={t("land.nameRequired")}
              value={partnerForm.name}
              onChange={(e) =>
                setPartnerForm({ ...partnerForm, name: e.target.value })
              }
            />
            <input
              placeholder={t("common.phone")}
              value={partnerForm.phone}
              onChange={(e) =>
                setPartnerForm({ ...partnerForm, phone: e.target.value })
              }
            />
            <input
              placeholder={t("land.pan")}
              value={partnerForm.panNumber}
              onChange={(e) =>
                setPartnerForm({ ...partnerForm, panNumber: e.target.value })
              }
            />
            <input
              placeholder={t("common.address")}
              value={partnerForm.address}
              onChange={(e) =>
                setPartnerForm({ ...partnerForm, address: e.target.value })
              }
            />
            <button
              className="primary"
              disabled={!partnerForm.name || createPartnerMut.isPending}
              onClick={() =>
                createPartnerMut.mutate({
                  name: partnerForm.name,
                  phone: partnerForm.phone || undefined,
                  panNumber: partnerForm.panNumber || undefined,
                  address: partnerForm.address || undefined,
                })
              }
            >
              {t("land.addPartner")}
            </button>
          </div>

          <div className="table">
            <div className="table-header partner-grid">
              <span>{t("common.name")}</span>
              <span>{t("common.phone")}</span>
              <span>{t("land.pan")}</span>
              <span>{t("land.parcels")}</span>
              <span></span>
            </div>
            {partners.map((p: LandPartner) => (
              <div key={p.id} className="table-row partner-grid">
                <span>{p.name}</span>
                <span>{p.phone || "—"}</span>
                <span>{p.panNumber || "—"}</span>
                <span>{p._count?.shares ?? 0}</span>
                <span>
                  <button
                    className="danger"
                    onClick={() => {
                      if (confirm(t("common.deactivateConfirm", { name: p.name })))
                        deactivatePartnerMut.mutate(p.id);
                    }}
                  >
                    {t("common.deactivate")}
                  </button>
                </span>
              </div>
            ))}
            {!partners.length && (
              <div className="table-row">
                <span>{t("land.noPartners")}</span>
              </div>
            )}
          </div>
        </div>

        <div className="page-card">
          <h3>{t("land.addParcel")}</h3>
          <p className="hint">{t("land.hint")}</p>
          <div className="form-grid-2">
            <input
              placeholder={t("land.parcelName")}
              value={parcelForm.name}
              onChange={(e) =>
                setParcelForm({ ...parcelForm, name: e.target.value })
              }
            />
            <select
              value={parcelForm.acquisitionType}
              onChange={(e) =>
                setParcelForm({
                  ...parcelForm,
                  acquisitionType: e.target.value,
                })
              }
            >
              {ACQUISITION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {t(type.labelKey)}
                </option>
              ))}
            </select>
            <input
              placeholder={t("land.surveyNo")}
              value={parcelForm.surveyNumber}
              onChange={(e) =>
                setParcelForm({ ...parcelForm, surveyNumber: e.target.value })
              }
            />
            <input
              placeholder={t("land.gatNo")}
              value={parcelForm.gatNumber}
              onChange={(e) =>
                setParcelForm({ ...parcelForm, gatNumber: e.target.value })
              }
            />
            <input
              placeholder={t("land.village")}
              value={parcelForm.village}
              onChange={(e) =>
                setParcelForm({ ...parcelForm, village: e.target.value })
              }
            />
            <input
              placeholder={t("land.taluka")}
              value={parcelForm.taluka}
              onChange={(e) =>
                setParcelForm({ ...parcelForm, taluka: e.target.value })
              }
            />
            <input
              placeholder={t("land.district")}
              value={parcelForm.district}
              onChange={(e) =>
                setParcelForm({ ...parcelForm, district: e.target.value })
              }
            />
            <input
              type="number"
              placeholder={t("land.areaAcres")}
              value={parcelForm.areaAcres}
              onChange={(e) =>
                setParcelForm({
                  ...parcelForm,
                  areaAcres: e.target.value === "" ? "" : +e.target.value,
                })
              }
            />
            <input
              type="number"
              placeholder={t("land.dealValue")}
              value={parcelForm.purchasePrice}
              onChange={(e) =>
                setParcelForm({
                  ...parcelForm,
                  purchasePrice: e.target.value === "" ? "" : +e.target.value,
                })
              }
            />
            <input
              type="date"
              title={t("land.agreementDate")}
              value={parcelForm.agreementDate}
              onChange={(e) =>
                setParcelForm({ ...parcelForm, agreementDate: e.target.value })
              }
            />
            <input
              type="date"
              title={t("land.registrationDate")}
              value={parcelForm.registrationDate}
              onChange={(e) =>
                setParcelForm({
                  ...parcelForm,
                  registrationDate: e.target.value,
                })
              }
            />
            <select
              value={parcelForm.status}
              onChange={(e) =>
                setParcelForm({ ...parcelForm, status: e.target.value })
              }
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
            <select
              value={parcelForm.projectId}
              onChange={(e) =>
                setParcelForm({ ...parcelForm, projectId: e.target.value })
              }
            >
              <option value="">{t("land.linkProject")}</option>
              {projects.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input
              placeholder={t("common.notes")}
              value={parcelForm.notes}
              onChange={(e) =>
                setParcelForm({ ...parcelForm, notes: e.target.value })
              }
            />
            <button
              className="primary"
              disabled={!parcelForm.name || createParcelMut.isPending}
              onClick={() =>
                createParcelMut.mutate({
                  name: parcelForm.name,
                  surveyNumber: parcelForm.surveyNumber || undefined,
                  gatNumber: parcelForm.gatNumber || undefined,
                  village: parcelForm.village || undefined,
                  taluka: parcelForm.taluka || undefined,
                  district: parcelForm.district || undefined,
                  areaAcres:
                    parcelForm.areaAcres === ""
                      ? undefined
                      : Number(parcelForm.areaAcres),
                  purchasePrice:
                    parcelForm.purchasePrice === ""
                      ? undefined
                      : Number(parcelForm.purchasePrice),
                  agreementDate: parcelForm.agreementDate || undefined,
                  registrationDate: parcelForm.registrationDate || undefined,
                  acquisitionType: parcelForm.acquisitionType,
                  status: parcelForm.projectId
                    ? "LINKED_TO_PROJECT"
                    : parcelForm.status,
                  projectId: parcelForm.projectId || undefined,
                  notes: parcelForm.notes || undefined,
                })
              }
            >
              {t("land.createParcel")}
            </button>
          </div>
        </div>
      </div>

      <div className="page-card">
        <div className="toolbar">
          <h3>{t("land.parcels")}</h3>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">{t("common.allStatuses")}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <p>{t("common.loading")}</p>
        ) : (
          <div className="parcel-list">
            {parcels.map((p: LandParcel) => (
              <div key={p.id} className="parcel-card">
                <div className="parcel-top">
                  <div>
                    <strong>{p.name}</strong>
                    <div className="meta">
                      {[p.surveyNumber && `Survey ${p.surveyNumber}`, p.gatNumber && `Gat ${p.gatNumber}`, p.village, p.taluka, p.district]
                        .filter(Boolean)
                        .join(" · ") || "No location details"}
                    </div>
                  </div>
                  <div className="badges">
                    <span className="badge type">
                      {p.acquisitionType.replace(/_/g, " ")}
                    </span>
                    <span className={`badge status ${p.status.toLowerCase()}`}>
                      {statusLabel(p.status)}
                    </span>
                  </div>
                </div>
                <div className="parcel-stats">
                  <span>
                    Area:{" "}
                    {p.areaAcres != null
                      ? `${p.areaAcres} acres`
                      : p.areaSqFt != null
                        ? `${p.areaSqFt} sq.ft`
                        : "—"}
                  </span>
                  <span>
                    Deal: {p.purchasePrice != null ? fmt(p.purchasePrice) : "—"}
                  </span>
                  <span>Project: {p.project?.name || "—"}</span>
                  <span>Payments: {p._count?.payments ?? 0}</span>
                </div>

                <div className="partners-inline">
                  <strong>{t("land.partners")}:</strong>
                  {(p.partners || []).length === 0 && (
                    <span className="muted"> {t("land.noneLinked")}</span>
                  )}
                  {(p.partners || []).map((s) => (
                    <span key={s.id} className="share-chip">
                      {s.partner.name}
                      {s.sharePercent != null ? ` ${s.sharePercent}%` : ""}
                      <button
                        type="button"
                        onClick={() =>
                          removeShareMut.mutate({
                            parcelId: p.id,
                            shareId: s.id,
                          })
                        }
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="parcel-actions">
                  <select
                    value={p.projectId || ""}
                    onChange={(e) =>
                      updateParcelMut.mutate({
                        id: p.id,
                        data: {
                          projectId: e.target.value || null,
                          status: e.target.value
                            ? "LINKED_TO_PROJECT"
                            : p.status === "LINKED_TO_PROJECT"
                              ? "REGISTERED"
                              : undefined,
                        },
                      })
                    }
                  >
                    <option value="">{t("land.unlinked")}</option>
                    {projects.map((pr: any) => (
                      <option key={pr.id} value={pr.id}>
                        {pr.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={p.status}
                    onChange={(e) =>
                      updateParcelMut.mutate({
                        id: p.id,
                        data: { status: e.target.value },
                      })
                    }
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {statusLabel(s)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
            {!parcels.length && (
              <p className="muted">{t("land.noParcels")}</p>
            )}
          </div>
        )}
      </div>

      <div className="land-grid">
        <div className="page-card">
          <h3>{t("land.linkPartnerToParcel")}</h3>
          <div className="form-grid-2">
            <select
              value={shareForm.parcelId}
              onChange={(e) =>
                setShareForm({ ...shareForm, parcelId: e.target.value })
              }
            >
              <option value="">{t("land.parcelRequired")}</option>
              {parcels.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <select
              value={shareForm.partnerId}
              onChange={(e) =>
                setShareForm({ ...shareForm, partnerId: e.target.value })
              }
            >
              <option value="">{t("land.partnerRequired")}</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <select
              value={shareForm.role}
              onChange={(e) =>
                setShareForm({ ...shareForm, role: e.target.value })
              }
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder={t("land.sharePercent")}
              value={shareForm.sharePercent}
              onChange={(e) =>
                setShareForm({
                  ...shareForm,
                  sharePercent: e.target.value === "" ? "" : +e.target.value,
                })
              }
            />
            <button
              className="primary"
              disabled={
                !shareForm.parcelId ||
                !shareForm.partnerId ||
                addShareMut.isPending
              }
              onClick={() => addShareMut.mutate()}
            >
              {t("land.linkPartner")}
            </button>
            {selectedParcel && (
              <span className="hint">
                {selectedParcel.acquisitionType.replace(/_/g, " ")} ·{" "}
                {(selectedParcel.partners || []).length} partners
              </span>
            )}
          </div>
        </div>

        <div className="page-card">
          <h3>{t("land.landPayment")}</h3>
          <p className="hint">{t("land.postsCashbook")}</p>
          <div className="form-grid-2">
            <select
              value={paymentForm.landParcelId}
              onChange={(e) =>
                setPaymentForm({
                  ...paymentForm,
                  landParcelId: e.target.value,
                })
              }
            >
              <option value="">{t("land.parcelRequired")}</option>
              {parcels.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <select
              value={paymentForm.partnerId}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, partnerId: e.target.value })
              }
            >
              <option value="">{t("land.payeePartner")}</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder={t("finance.amountRequired")}
              value={paymentForm.amount}
              onChange={(e) =>
                setPaymentForm({
                  ...paymentForm,
                  amount: e.target.value === "" ? "" : +e.target.value,
                })
              }
            />
            <input
              type="date"
              value={paymentForm.date}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, date: e.target.value })
              }
            />
            <select
              value={paymentForm.bankAccountId}
              onChange={(e) =>
                setPaymentForm({
                  ...paymentForm,
                  bankAccountId: e.target.value,
                })
              }
            >
              <option value="">{t("common.cashbookAccount")}</option>
              {accounts.map((a: any) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <input
              placeholder={t("common.reference")}
              value={paymentForm.reference}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, reference: e.target.value })
              }
            />
            <input
              placeholder={t("common.description")}
              value={paymentForm.description}
              onChange={(e) =>
                setPaymentForm({
                  ...paymentForm,
                  description: e.target.value,
                })
              }
            />
            <button
              className="primary"
              disabled={
                !paymentForm.landParcelId ||
                !paymentForm.amount ||
                payMut.isPending
              }
              onClick={() =>
                payMut.mutate({
                  landParcelId: paymentForm.landParcelId,
                  amount: Number(paymentForm.amount),
                  partnerId: paymentForm.partnerId || undefined,
                  date: paymentForm.date,
                  description: paymentForm.description || undefined,
                  reference: paymentForm.reference || undefined,
                  bankAccountId: paymentForm.bankAccountId || undefined,
                })
              }
            >
              {t("land.recordPayment")}
            </button>
          </div>
        </div>
      </div>

      <div className="page-card">
        <h3>{t("land.payments")}</h3>
        <div className="table">
          <div className="table-header payment-grid">
            <span>{t("common.date")}</span>
            <span>{t("land.parcels")}</span>
            <span>{t("land.partners")}</span>
            <span>{t("common.amount")}</span>
            <span>{t("finance.allAccounts")}</span>
            <span>{t("common.notes")}</span>
          </div>
          {payments.map((pay: any) => (
            <div key={pay.id} className="table-row payment-grid">
              <span>{new Date(pay.date).toLocaleDateString("en-IN")}</span>
              <span>{pay.parcel?.name}</span>
              <span>{pay.partner?.name || "—"}</span>
              <span>{fmt(pay.amount)}</span>
              <span>{pay.bankAccount?.name || "—"}</span>
              <span>{pay.description || pay.reference || "—"}</span>
            </div>
          ))}
          {!payments.length && (
            <div className="table-row">
              <span>{t("land.noPayments")}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
