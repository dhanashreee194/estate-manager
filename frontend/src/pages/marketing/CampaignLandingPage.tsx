import { useMemo, useState, type FormEvent } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  getPublicCampaign,
  submitPublicLead,
} from "../../api/marketing";
import "./marketing.css";

export default function CampaignLandingPage() {
  const { t } = useTranslation();
  const { code = "" } = useParams();
  const [params] = useSearchParams();
  const src = params.get("src") || "website";

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [done, setDone] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["public-campaign", code],
    queryFn: () => getPublicCampaign(code),
    enabled: !!code,
    retry: false,
  });

  const source = useMemo(() => {
    const map: Record<string, string> = {
      facebook: "FACEBOOK",
      instagram: "INSTAGRAM",
      whatsapp: "WHATSAPP",
      website: "WEBSITE",
    };
    return map[src.toLowerCase()] || "WEBSITE";
  }, [src]);

  const submitMut = useMutation({
    mutationFn: () =>
      submitPublicLead(
        code,
        {
          name: form.name,
          phone: form.phone,
          email: form.email || undefined,
          message: form.message || undefined,
          source,
        },
        src,
      ),
    onSuccess: () => setDone(true),
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    submitMut.mutate();
  };

  if (isLoading) {
    return (
      <div className="campaign-landing">
        <p>{t("common.loading")}</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="campaign-landing">
        <h2>{t("marketing.landingNotFound")}</h2>
      </div>
    );
  }

  if (done) {
    return (
      <div className="campaign-landing thanks">
        <h2>{t("marketing.thanksTitle")}</h2>
        <p>{t("marketing.thanksBody")}</p>
      </div>
    );
  }

  return (
    <div className="campaign-landing">
      <div className="brand">{data.companyName}</div>
      {data.imageUrl && (
        <img src={data.imageUrl} alt="" className="creative-image" />
      )}
      <h1>{data.headline}</h1>
      <p>{data.body}</p>
      <p className="muted">
        {data.project.name}
        {data.project.location ? ` · ${data.project.location}` : ""}
        {data.unit
          ? ` · ${data.unit.unitType} ${data.unit.unitNumber}${
              data.unit.bhkType ? ` · ${data.unit.bhkType}` : ""
            } · ₹${Number(data.unit.basePrice).toLocaleString("en-IN")}`
          : ""}
      </p>

      <form onSubmit={onSubmit}>
        <h3>{data.ctaLabel || t("marketing.enquire")}</h3>
        <label>
          {t("common.name")}
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label>
          {t("common.phone")}
          <input
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </label>
        <label>
          {t("common.email")}
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label>
          {t("marketing.message")}
          <textarea
            rows={3}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
        </label>
        <button
          className="primary-btn"
          type="submit"
          disabled={submitMut.isPending}
        >
          {submitMut.isPending ? t("common.saving") : data.ctaLabel}
        </button>
        {submitMut.isError && (
          <p style={{ color: "salmon" }}>{t("marketing.submitFailed")}</p>
        )}
      </form>
    </div>
  );
}
