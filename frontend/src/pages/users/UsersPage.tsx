import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getCustomers } from "../../api/customer";
import EditCustomerModal from "./EditCustomerModal";
import "./customers.css";

export default function CustomersPage() {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editCustomer, setEditCustomer] = useState<any>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCustomers(search);
      setCustomers(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Failed to load customers", err);
      setCustomers([]);
      setError(t("users.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [search, t]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () =>
    setEditCustomer({
      name: "",
      phone: "",
      email: "",
      address: "",
      panNumber: "",
      aadharNumber: "",
    });

  return (
    <div className="customers-page">
      <div className="page-card">
        <div className="customers-toolbar">
          <div className="customers-toolbar-left">
            <h2>{t("users.customers")}</h2>
            <button type="button" className="primary-btn" onClick={openCreate}>
              {t("users.addCustomer")}
            </button>
          </div>
          <input
            className="customers-search"
            placeholder={t("users.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading && <p className="muted">{t("users.loading")}</p>}
        {error && <p className="customers-error">{error}</p>}

        {!loading && !error && customers.length === 0 && (
          <p className="muted">{t("users.empty")}</p>
        )}

        {!loading && customers.length > 0 && (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>{t("common.name")}</th>
                  <th>{t("common.phone")}</th>
                  <th>{t("common.email")}</th>
                  <th>{t("users.pan")}</th>
                  <th>{t("users.aadhar")}</th>
                  <th>{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.phone}</td>
                    <td>{c.email || "—"}</td>
                    <td>{c.panNumber || "—"}</td>
                    <td>{c.aadharNumber || "—"}</td>
                    <td>
                      <div className="customers-actions">
                        <button type="button" onClick={() => setEditCustomer(c)}>
                          {t("common.edit")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EditCustomerModal
        customer={editCustomer}
        onClose={() => setEditCustomer(null)}
        onSaved={load}
      />
    </div>
  );
}
