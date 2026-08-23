import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  composeCampaign,
  createCampaign,
  generateAiCaption,
  generateAiImage,
  getCampaign,
  getCampaigns,
  recordShareEvent,
  setCampaignStatus,
  type CampaignStatus,
  type CreateCampaignPayload,
  type MarketingCampaign,
  type ShareChannel,
} from "../../api/marketing";
import { API_BASE } from "../../api/baseUrl";
import { getProjects } from "../../api/project";
import { getProjectUnits } from "../../api/unit";
import "./marketing.css";

const emptyForm: CreateCampaignPayload = {
  title: "",
  projectId: "",
  unitId: undefined,
  headline: "",
  body: "",
  ctaLabel: "Enquire now",
  ctaPhone: "",
  imageUrl: "",
  enableWhatsapp: true,
  enableFacebook: true,
  enableInstagram: true,
  status: "DRAFT",
};

function statusClass(status: CampaignStatus) {
  return `camp-status camp-status-${status.toLowerCase()}`;
}

export default function MarketingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [params] = useSearchParams();
  const prefillProjectId = params.get("projectId") || "";
  const prefillUnitId = params.get("unitId") || "";

  const [view, setView] = useState<"list" | "create" | "detail">(
    prefillProjectId ? "create" : "list",
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "">("");
  const [form, setForm] = useState<CreateCampaignPayload>({
    ...emptyForm,
    projectId: prefillProjectId,
    unitId: prefillUnitId || undefined,
  });
  const [copyDone, setCopyDone] = useState(false);
  const [aiComments, setAiComments] = useState("");
  const [aiError, setAiError] = useState("");
  const [lastImagePrompt, setLastImagePrompt] = useState("");

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["marketing-campaigns", statusFilter],
    queryFn: () =>
      getCampaigns(statusFilter ? (statusFilter as CampaignStatus) : undefined),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  const { data: units = [] } = useQuery({
    queryKey: ["units", form.projectId],
    queryFn: () => getProjectUnits(form.projectId),
    enabled: !!form.projectId,
  });

  const { data: detail } = useQuery({
    queryKey: ["marketing-campaign", selectedId],
    queryFn: () => getCampaign(selectedId!),
    enabled: !!selectedId && view === "detail",
  });

  const { data: compose, refetch: refetchCompose } = useQuery({
    queryKey: ["marketing-compose", selectedId],
    queryFn: () => composeCampaign(selectedId!),
    enabled: !!selectedId && view === "detail",
  });

  const createMut = useMutation({
    mutationFn: createCampaign,
    onSuccess: (c: MarketingCampaign) => {
      queryClient.invalidateQueries({ queryKey: ["marketing-campaigns"] });
      setSelectedId(c.id);
      setView("detail");
      setForm(emptyForm);
    },
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CampaignStatus }) =>
      setCampaignStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketing-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["marketing-campaign", selectedId] });
      refetchCompose();
    },
  });

  const shareMut = useMutation({
    mutationFn: ({ id, channel }: { id: string; channel: ShareChannel }) =>
      recordShareEvent(id, channel),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketing-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["marketing-campaign", selectedId] });
    },
  });

  const captionMut = useMutation({
    mutationFn: generateAiCaption,
    onSuccess: (data) => {
      setAiError("");
      setForm((f) => ({
        ...f,
        title: data.title || f.title,
        headline: data.headline || f.headline,
        body: data.body || f.body,
        ctaLabel: data.ctaLabel || f.ctaLabel,
      }));
      if (data.imagePrompt) setLastImagePrompt(data.imagePrompt);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message;
      setAiError(
        (Array.isArray(msg) ? msg.join(", ") : msg) ||
          err?.message ||
          t("marketing.aiFailed"),
      );
    },
  });

  const imageMut = useMutation({
    mutationFn: generateAiImage,
    onSuccess: (data) => {
      setAiError("");
      const url = data.imageUrl?.startsWith("http")
        ? data.imageUrl
        : `${API_BASE}${data.imageUrl}`;
      setForm((f) => ({ ...f, imageUrl: url }));
      if (data.imagePrompt) setLastImagePrompt(data.imagePrompt);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message;
      setAiError(
        (Array.isArray(msg) ? msg.join(", ") : msg) ||
          err?.message ||
          t("marketing.aiFailed"),
      );
    },
  });

  const aiPayload = () => ({
    projectId: form.projectId,
    unitId: form.unitId || undefined,
    comments: aiComments.trim(),
    language: (typeof localStorage !== "undefined" &&
    localStorage.getItem("i18nextLng")?.startsWith("mr")
      ? "Marathi"
      : "English") as string,
    headline: form.headline || undefined,
    body: form.body || undefined,
  });

  const runAiCaption = () => {
    if (!form.projectId) {
      setAiError(t("marketing.aiNeedProject"));
      return;
    }
    if (aiComments.trim().length < 3) {
      setAiError(t("marketing.aiNeedComments"));
      return;
    }
    captionMut.mutate(aiPayload());
  };

  const runAiImage = () => {
    if (!form.projectId) {
      setAiError(t("marketing.aiNeedProject"));
      return;
    }
    if (aiComments.trim().length < 3) {
      setAiError(t("marketing.aiNeedComments"));
      return;
    }
    imageMut.mutate(aiPayload());
  };

  const availableUnits = useMemo(
    () =>
      (units as any[]).filter(
        (u) => !u.status || u.status === "AVAILABLE" || u.id === form.unitId,
      ),
    [units, form.unitId],
  );

  const openDetail = (id: string) => {
    setSelectedId(id);
    setView("detail");
  };

  const onShare = async (channel: ShareChannel, url?: string | null) => {
    if (!selectedId) return;
    await shareMut.mutateAsync({ id: selectedId, channel });
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const copyCaption = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopyDone(true);
    setTimeout(() => setCopyDone(false), 2000);
    if (selectedId) {
      shareMut.mutate({ id: selectedId, channel: "INSTAGRAM" });
    }
  };

  const submitCreate = (
    e: React.FormEvent,
    status: CampaignStatus = "DRAFT",
  ) => {
    e.preventDefault();
    if (!form.title || !form.projectId || !form.headline || !form.body) return;
    createMut.mutate({
      ...form,
      status,
      unitId: form.unitId || undefined,
      ctaPhone: form.ctaPhone || undefined,
      imageUrl: form.imageUrl || undefined,
    });
  };

  return (
    <div className="marketing-page">
      <div className="marketing-header">
        <div>
          <h2>{t("marketing.title")}</h2>
          <p className="muted">{t("marketing.subtitle")}</p>
        </div>
        <div className="marketing-actions">
          {view !== "list" && (
            <button className="secondary-btn" onClick={() => setView("list")}>
              {t("marketing.backToList")}
            </button>
          )}
          {view === "list" && (
            <button className="primary-btn" onClick={() => setView("create")}>
              + {t("marketing.newCampaign")}
            </button>
          )}
        </div>
      </div>

      {view === "list" && (
        <>
          <div className="marketing-filters">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as CampaignStatus | "")
              }
            >
              <option value="">{t("marketing.allStatuses")}</option>
              <option value="DRAFT">DRAFT</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="PAUSED">PAUSED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>

          {isLoading ? (
            <p>{t("common.loading")}</p>
          ) : campaigns.length === 0 ? (
            <div className="empty-state">{t("marketing.empty")}</div>
          ) : (
            <div className="campaign-table">
              <div className="campaign-row head">
                <span>{t("marketing.campaign")}</span>
                <span>{t("common.project")}</span>
                <span>{t("marketing.unit")}</span>
                <span>{t("common.status")}</span>
                <span>{t("marketing.stats")}</span>
              </div>
              {campaigns.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="campaign-row"
                  onClick={() => openDetail(c.id)}
                >
                  <span>
                    <strong>{c.title}</strong>
                    <small>/{c.code}</small>
                  </span>
                  <span>{c.project?.name || "—"}</span>
                  <span>
                    {c.unit
                      ? `${c.unit.unitType} ${c.unit.unitNumber}`
                      : t("marketing.wholeProject")}
                  </span>
                  <span className={statusClass(c.status)}>{c.status}</span>
                  <span>
                    {c.shareCount} {t("marketing.shares")} · {c.leadCount}{" "}
                    {t("marketing.leads")}
                  </span>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {view === "create" && (
        <form className="campaign-form" onSubmit={(e) => submitCreate(e, "DRAFT")}>
          <h3>{t("marketing.newCampaign")}</h3>
          <label>
            {t("marketing.campaignTitle")}
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </label>
          <label>
            {t("common.project")}
            <select
              required
              value={form.projectId}
              onChange={(e) =>
                setForm({ ...form, projectId: e.target.value, unitId: undefined })
              }
            >
              <option value="">{t("marketing.selectProject")}</option>
              {(projects as any[]).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t("marketing.unitOptional")}
            <select
              value={form.unitId || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  unitId: e.target.value || undefined,
                })
              }
              disabled={!form.projectId}
            >
              <option value="">{t("marketing.wholeProject")}</option>
              {availableUnits.map((u: any) => (
                <option key={u.id} value={u.id}>
                  {u.unitType} {u.unitNumber}
                  {u.bhkType ? ` · ${u.bhkType}` : ""} · ₹
                  {Number(u.basePrice).toLocaleString("en-IN")}
                </option>
              ))}
            </select>
          </label>

          <div className="ai-assist-panel">
            <h4>{t("marketing.aiAssist")}</h4>
            <p className="muted">{t("marketing.aiAssistHint")}</p>
            <label>
              {t("marketing.aiComments")}
              <textarea
                rows={4}
                value={aiComments}
                onChange={(e) => setAiComments(e.target.value)}
                placeholder={t("marketing.aiCommentsPlaceholder")}
              />
            </label>
            <div className="share-buttons">
              <button
                type="button"
                className="primary-btn"
                disabled={captionMut.isPending || imageMut.isPending}
                onClick={runAiCaption}
              >
                {captionMut.isPending
                  ? t("marketing.aiGeneratingCaption")
                  : t("marketing.aiGenerateCaption")}
              </button>
              <button
                type="button"
                className="secondary-btn"
                disabled={captionMut.isPending || imageMut.isPending}
                onClick={runAiImage}
              >
                {imageMut.isPending
                  ? t("marketing.aiGeneratingImage")
                  : t("marketing.aiGenerateImage")}
              </button>
            </div>
            {aiError && <p className="ai-error">{aiError}</p>}
            {lastImagePrompt && (
              <p className="muted ai-prompt-note">
                {t("marketing.aiImagePrompt")}: {lastImagePrompt}
              </p>
            )}
          </div>

          <label>
            {t("marketing.headline")}
            <input
              required
              value={form.headline}
              onChange={(e) => setForm({ ...form, headline: e.target.value })}
            />
          </label>
          <label>
            {t("marketing.body")}
            <textarea
              required
              rows={4}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
          </label>
          <div className="form-row">
            <label>
              {t("marketing.ctaLabel")}
              <input
                value={form.ctaLabel}
                onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
              />
            </label>
            <label>
              {t("marketing.ctaPhone")}
              <input
                value={form.ctaPhone}
                onChange={(e) => setForm({ ...form, ctaPhone: e.target.value })}
                placeholder="+91..."
              />
            </label>
          </div>
          <label>
            {t("marketing.imageUrl")}
            <input
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://"
            />
          </label>
          {form.imageUrl && (
            <img src={form.imageUrl} alt="" className="creative-image" />
          )}
          <div className="channel-toggles">
            <label>
              <input
                type="checkbox"
                checked={!!form.enableWhatsapp}
                onChange={(e) =>
                  setForm({ ...form, enableWhatsapp: e.target.checked })
                }
              />
              WhatsApp
            </label>
            <label>
              <input
                type="checkbox"
                checked={!!form.enableFacebook}
                onChange={(e) =>
                  setForm({ ...form, enableFacebook: e.target.checked })
                }
              />
              Facebook
            </label>
            <label>
              <input
                type="checkbox"
                checked={!!form.enableInstagram}
                onChange={(e) =>
                  setForm({ ...form, enableInstagram: e.target.checked })
                }
              />
              Instagram
            </label>
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={() => {
                setForm({
                  ...emptyForm,
                  projectId: prefillProjectId,
                  unitId: prefillUnitId || undefined,
                });
              }}
            >
              {t("marketing.clearForm")}
            </button>
            <button
              type="button"
              className="secondary-btn"
              disabled={createMut.isPending}
              onClick={(e) => submitCreate(e as any, "DRAFT")}
            >
              {t("marketing.saveDraft")}
            </button>
            <button
              type="button"
              className="primary-btn"
              disabled={createMut.isPending}
              onClick={(e) => submitCreate(e as any, "ACTIVE")}
            >
              {t("marketing.saveActivate")}
            </button>
          </div>
        </form>
      )}

      {view === "detail" && detail && (
        <div className="campaign-detail">
          <div className="detail-top">
            <div>
              <h3>{detail.title}</h3>
              <p className="muted">
                {detail.project?.name}
                {detail.unit
                  ? ` · ${detail.unit.unitType} ${detail.unit.unitNumber}`
                  : ` · ${t("marketing.wholeProject")}`}
              </p>
              <span className={statusClass(detail.status)}>{detail.status}</span>
            </div>
            <div className="status-actions">
              {detail.status !== "ACTIVE" && (
                <button
                  className="primary-btn"
                  onClick={() =>
                    statusMut.mutate({ id: detail.id, status: "ACTIVE" })
                  }
                >
                  {t("marketing.activate")}
                </button>
              )}
              {detail.status === "ACTIVE" && (
                <button
                  className="secondary-btn"
                  onClick={() =>
                    statusMut.mutate({ id: detail.id, status: "PAUSED" })
                  }
                >
                  {t("marketing.pause")}
                </button>
              )}
              <button
                className="secondary-btn"
                onClick={() =>
                  statusMut.mutate({ id: detail.id, status: "ARCHIVED" })
                }
              >
                {t("marketing.archive")}
              </button>
            </div>
          </div>

          <div className="stats-row">
            <div className="stat-card">
              <span>{t("marketing.shares")}</span>
              <strong>{detail.shareCount}</strong>
            </div>
            <div className="stat-card">
              <span>{t("marketing.views")}</span>
              <strong>{detail.landingViewCount}</strong>
            </div>
            <div className="stat-card">
              <span>{t("marketing.leads")}</span>
              <strong>{detail.leadCount}</strong>
            </div>
          </div>

          <div className="creative-preview">
            <h4>{t("marketing.preview")}</h4>
            {detail.imageUrl && (
              <img src={detail.imageUrl} alt="" className="creative-image" />
            )}
            <h3>{detail.headline}</h3>
            <p>{detail.body}</p>
            <p className="muted">{detail.ctaLabel}</p>
          </div>

          {compose && (
            <div className="share-panel">
              <h4>{t("marketing.share")}</h4>
              <p className="landing-link">
                {t("marketing.landing")}:{" "}
                <a href={compose.landingUrl} target="_blank" rel="noreferrer">
                  {compose.landingUrl}
                </a>
              </p>
              <div className="share-buttons">
                {compose.links.whatsapp && (
                  <button
                    className="primary-btn"
                    type="button"
                    onClick={() =>
                      onShare("WHATSAPP", compose.links.whatsapp!.url)
                    }
                  >
                    WhatsApp
                  </button>
                )}
                {compose.links.facebook && (
                  <button
                    className="primary-btn"
                    type="button"
                    onClick={() =>
                      onShare("FACEBOOK", compose.links.facebook!.url)
                    }
                  >
                    Facebook
                  </button>
                )}
                {compose.links.instagram && (
                  <button
                    className="secondary-btn"
                    type="button"
                    onClick={() =>
                      copyCaption(compose.links.instagram!.copyText)
                    }
                  >
                    {copyDone
                      ? t("marketing.copied")
                      : t("marketing.copyInstagram")}
                  </button>
                )}
              </div>
              <pre className="caption-box">{compose.caption}</pre>
            </div>
          )}

          <p className="muted">
            <Link to="/dashboard/leads">{t("marketing.viewLeads")}</Link>
            {" · "}
            <button
              type="button"
              className="linkish"
              onClick={() => navigate("/dashboard/marketing")}
            >
              {t("marketing.backToList")}
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
