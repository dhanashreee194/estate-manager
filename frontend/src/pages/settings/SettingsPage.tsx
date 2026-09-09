import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  companyAssetUrl,
  getCompanySettings,
  updateCompanySettings,
  uploadCompanyLogo,
  type CompanySettings,
} from "../../api/company";
import { getTeamUsers, type TeamUser } from "../../api/user";
import InviteUserModal from "../../components/InviteUserModal";
import "./settings.css";

const emptyForm = {
  name: "",
  phone: "",
  address: "",
  gstNumber: "",
  panNumber: "",
  invoicePrefix: "INV",
  invoiceFooter: "",
  billTitle: "",
  showGstOnDocs: true,
};

export default function SettingsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setUsersError(null);
      setUsers(await getTeamUsers());
    } catch (err: any) {
      setUsers([]);
      setUsersError(err?.response?.data?.message || t("team.loadFailed"));
    }
  }, [t]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCompanySettings();
      setCompany(data);
      setForm({
        name: data.name || "",
        phone: data.phone || "",
        address: data.address || "",
        gstNumber: data.gstNumber || "",
        panNumber: data.panNumber || "",
        invoicePrefix: data.invoicePrefix || "INV",
        invoiceFooter: data.invoiceFooter || "",
        billTitle: data.billTitle || "",
        showGstOnDocs: data.showGstOnDocs !== false,
      });
      await loadUsers();
    } catch (err: any) {
      setError(err?.response?.data?.message || t("settings.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [loadUsers, t]);

  useEffect(() => {
    load();
  }, [load]);

  const setField = (key: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSuccess(null);
  };

  const saveProfile = async () => {
    if (!form.name.trim()) {
      setError(t("settings.nameRequired"));
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const updated = await updateCompanySettings({
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        gstNumber: form.gstNumber.trim(),
        panNumber: form.panNumber.trim(),
      });
      setCompany(updated);
      setSuccess(t("settings.saved"));
    } catch (err: any) {
      setError(err?.response?.data?.message || t("settings.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const saveInvoice = async () => {
    try {
      setSaving(true);
      setError(null);
      const updated = await updateCompanySettings({
        invoicePrefix: form.invoicePrefix.trim() || "INV",
        invoiceFooter: form.invoiceFooter.trim(),
        billTitle: form.billTitle.trim(),
        showGstOnDocs: form.showGstOnDocs,
      });
      setCompany(updated);
      setSuccess(t("settings.invoiceSaved"));
    } catch (err: any) {
      setError(err?.response?.data?.message || t("settings.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const onLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setSaving(true);
      setError(null);
      const updated = await uploadCompanyLogo(file);
      setCompany(updated);
      setSuccess(t("settings.logoSaved"));
    } catch (err: any) {
      setError(err?.response?.data?.message || t("settings.logoFailed"));
    } finally {
      setSaving(false);
    }
  };

  const logoSrc = companyAssetUrl(company?.logoUrl);

  if (loading) {
    return (
      <div className="settings-page">
        <p className="muted">{t("settings.loading")}</p>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h2>{t("settings.title")}</h2>
        <p className="hint">{t("settings.hint")}</p>
      </div>

      {error && <p className="settings-error">{error}</p>}
      {success && <p className="settings-success">{success}</p>}

      {/* 1. Company name & logo */}
      <section className="page-card settings-section" id="company">
        <h3>{t("settings.companySection")}</h3>
        <div className="settings-logo-row">
          <div className="settings-logo-preview">
            {logoSrc ? (
              <img src={logoSrc} alt={company?.name || "Logo"} />
            ) : (
              <span>{t("settings.noLogo")}</span>
            )}
          </div>
          <div>
            <label className="settings-file-btn">
              {t("settings.uploadLogo")}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={onLogoChange}
                disabled={saving}
              />
            </label>
            <p className="muted small">{t("settings.logoHint")}</p>
          </div>
        </div>

        <div className="settings-grid">
          <label>
            {t("settings.companyName")}
            <input
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
            />
          </label>
          <label>
            {t("common.email")}
            <input value={company?.email || ""} disabled />
          </label>
          <label>
            {t("common.phone")}
            <input
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              placeholder={t("settings.phonePlaceholder")}
            />
          </label>
          <label>
            {t("settings.gst")}
            <input
              value={form.gstNumber}
              onChange={(e) => setField("gstNumber", e.target.value)}
              placeholder="GSTIN"
            />
          </label>
          <label>
            {t("settings.pan")}
            <input
              value={form.panNumber}
              onChange={(e) => setField("panNumber", e.target.value)}
              placeholder="PAN"
            />
          </label>
        </div>
      </section>

      {/* 3. Permanent office address */}
      <section className="page-card settings-section" id="address">
        <h3>{t("settings.addressSection")}</h3>
        <label>
          {t("settings.officeAddress")}
          <textarea
            rows={3}
            value={form.address}
            onChange={(e) => setField("address", e.target.value)}
            placeholder={t("settings.addressPlaceholder")}
          />
        </label>
        <div className="settings-actions">
          <button
            type="button"
            className="primary-btn"
            disabled={saving}
            onClick={saveProfile}
          >
            {saving ? t("common.saving") : t("settings.saveCompany")}
          </button>
        </div>
      </section>

      {/* 2. Users & access */}
      <section className="page-card settings-section" id="users">
        <div className="settings-section-head">
          <h3>{t("settings.usersSection")}</h3>
          <button
            type="button"
            className="primary-btn"
            onClick={() => setInviteOpen(true)}
          >
            {t("team.addUser")}
          </button>
        </div>
        <p className="hint">{t("team.hint")}</p>
        {usersError && <p className="settings-error">{usersError}</p>}
        {!usersError && users.length === 0 && (
          <p className="muted">{t("team.empty")}</p>
        )}
        {users.length > 0 && (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>{t("common.name")}</th>
                  <th>{t("common.email")}</th>
                  <th>{t("team.role")}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className="role-pill">
                        {t(`roles.${u.role}`, { defaultValue: u.role })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 4. Invoice & bill format */}
      <section className="page-card settings-section" id="invoice">
        <h3>{t("settings.invoiceSection")}</h3>
        <p className="hint">{t("settings.invoiceHint")}</p>
        <div className="settings-grid">
          <label>
            {t("settings.invoicePrefix")}
            <input
              value={form.invoicePrefix}
              onChange={(e) => setField("invoicePrefix", e.target.value)}
              placeholder="INV"
            />
          </label>
          <label>
            {t("settings.billTitle")}
            <input
              value={form.billTitle}
              onChange={(e) => setField("billTitle", e.target.value)}
              placeholder={t("settings.billTitlePlaceholder")}
            />
          </label>
        </div>
        <label className="settings-check">
          <input
            type="checkbox"
            checked={form.showGstOnDocs}
            onChange={(e) => setField("showGstOnDocs", e.target.checked)}
          />
          {t("settings.showGstOnDocs")}
        </label>
        <label>
          {t("settings.invoiceFooter")}
          <textarea
            rows={3}
            value={form.invoiceFooter}
            onChange={(e) => setField("invoiceFooter", e.target.value)}
            placeholder={t("settings.invoiceFooterPlaceholder")}
          />
        </label>
        <div className="settings-actions">
          <button
            type="button"
            className="primary-btn"
            disabled={saving}
            onClick={saveInvoice}
          >
            {saving ? t("common.saving") : t("settings.saveInvoice")}
          </button>
        </div>
      </section>

      <InviteUserModal
        open={inviteOpen}
        onClose={() => {
          setInviteOpen(false);
          loadUsers();
        }}
      />
    </div>
  );
}
