import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  createExpense,
  getProjectExpenses,
  getProjectExpenseReport,
  PAYMENT_MODES,
} from "../../../api/expense";
import { getBudget, setBudget } from "../../../api/budget";
import { getVendors } from "../../../api/vendor";
import { getBankAccounts } from "../../../api/finance";
import "../projects.css";

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function formatDateTime(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toDateTimeLocalValue(d = new Date()) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function baseAmountOf(e: any) {
  const total = Number(e.amount || 0);
  const gst = Number(e.gstAmount || 0);
  return Math.max(0, total - gst);
}

export default function ExpensesPage() {
  const { t } = useTranslation();
  const { projectId } = useParams();

  const [expenses, setExpenses] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [budget, setBudgetState] = useState<any>(null);
  const [budgetAmount, setBudgetAmount] = useState(0);
  const [vendors, setVendors] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: "OTHER",
    amount: 0,
    date: toDateTimeLocalValue(),
    description: "",
    gstRate: 0,
    vendorId: "",
    bankAccountId: "",
    paymentMode: "CASH",
  });

  useEffect(() => {
    if (!projectId) return;
    loadData();
    getVendors().then(setVendors).catch(console.error);
    getBankAccounts().then(setAccounts).catch(console.error);
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [list, report, budgetRes] = await Promise.all([
        getProjectExpenses(projectId!),
        getProjectExpenseReport(projectId!),
        getBudget(projectId!).catch(() => null),
      ]);
      setExpenses(list);
      setSummary(report);
      setBudgetState(budgetRes);
      setBudgetAmount(budgetRes?.amount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const previewGst = useMemo(() => {
    const base = Number(form.amount || 0);
    const rate = Number(form.gstRate || 0);
    const gst = rate ? (base * rate) / 100 : 0;
    return { base, gst, total: base + gst };
  }, [form.amount, form.gstRate]);

  const saveExpense = async () => {
    if (!projectId || !form.amount) return;
    try {
      setSaving(true);
      await createExpense({
        projectId,
        type: form.type,
        amount: Number(form.amount),
        date: new Date(form.date).toISOString(),
        description: form.description || undefined,
        gstRate: Number(form.gstRate) || undefined,
        vendorId: form.vendorId || undefined,
        bankAccountId: form.bankAccountId || undefined,
        paymentMode: form.paymentMode || undefined,
      });
      setForm({
        type: "OTHER",
        amount: 0,
        date: toDateTimeLocalValue(),
        description: "",
        gstRate: 0,
        vendorId: "",
        bankAccountId: "",
        paymentMode: "CASH",
      });
      await loadData();
    } catch (err) {
      console.error(err);
      alert(t("expenses.saveExpenseFailed"));
    } finally {
      setSaving(false);
    }
  };

  const saveBudget = async () => {
    if (!projectId) return;
    try {
      const res = await setBudget(projectId, Number(budgetAmount));
      setBudgetState(res);
    } catch (err) {
      console.error(err);
      alert(t("expenses.saveBudgetFailed"));
    }
  };

  if (loading) {
    return <div className="loading">{t("expenses.loading")}</div>;
  }

  const spent = summary?.totalCost ?? 0;
  const budgetVal = budget?.amount ?? budgetAmount ?? 0;
  const remaining = budgetVal - spent;

  return (
    <div className="expenses-page">
      <div className="expense-summary">
        <div className="summary-card">
          <h4>{t("expenses.totalCost")}</h4>
          <p>{formatMoney(spent)}</p>
        </div>
        <div className="summary-card">
          <h4>{t("expenses.material")}</h4>
          <p>{formatMoney(summary?.breakdown?.MATERIAL ?? 0)}</p>
        </div>
        <div className="summary-card">
          <h4>{t("expenses.labour")}</h4>
          <p>{formatMoney(summary?.breakdown?.LABOUR ?? 0)}</p>
        </div>
        <div className="summary-card">
          <h4>{t("expenses.other")}</h4>
          <p>{formatMoney(summary?.breakdown?.OTHER ?? 0)}</p>
        </div>
        <div className="summary-card">
          <h4>{t("expenses.budget")}</h4>
          <p>{formatMoney(budgetVal)}</p>
        </div>
        <div className="summary-card">
          <h4>{t("expenses.remaining")}</h4>
          <p>{formatMoney(remaining)}</p>
        </div>
      </div>

      <div className="page-card" style={{ marginBottom: "1rem" }}>
        <h3>{t("expenses.projectBudget")}</h3>
        <div className="form-row">
          <input
            type="number"
            value={budgetAmount}
            onChange={(e) => setBudgetAmount(+e.target.value)}
            placeholder={t("expenses.budgetAmount")}
          />
          <button className="primary-btn" onClick={saveBudget}>
            {t("expenses.saveBudget")}
          </button>
        </div>
      </div>

      <div className="page-card" style={{ marginBottom: "1rem" }}>
        <h3>{t("expenses.add")}</h3>
        <p className="hint">{t("expenses.gstHint")}</p>
        <div className="form-row" style={{ flexWrap: "wrap" }}>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="OTHER">{t("expenses.other")}</option>
            <option value="VENDOR_PAYMENT">{t("expenses.vendorPayment")}</option>
            <option value="MATERIAL_PURCHASE">
              {t("expenses.materialPurchase")}
            </option>
            <option value="LABOUR">{t("expenses.labour")}</option>
            <option value="MATERIAL">{t("expenses.material")}</option>
          </select>
          <input
            type="number"
            placeholder={t("expenses.baseAmount")}
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: +e.target.value })}
          />
          <input
            type="number"
            placeholder={t("common.gstPercent")}
            value={form.gstRate}
            onChange={(e) => setForm({ ...form, gstRate: +e.target.value })}
          />
          <input
            type="datetime-local"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <select
            value={form.paymentMode}
            onChange={(e) =>
              setForm({ ...form, paymentMode: e.target.value })
            }
          >
            {PAYMENT_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {t(`expenses.modes.${mode}`, { defaultValue: mode })}
              </option>
            ))}
          </select>
          <select
            value={form.vendorId}
            onChange={(e) => setForm({ ...form, vendorId: e.target.value })}
          >
            <option value="">
              {t("common.vendor")} ({t("common.optional")})
            </option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
          <select
            value={form.bankAccountId}
            onChange={(e) =>
              setForm({ ...form, bankAccountId: e.target.value })
            }
          >
            <option value="">{t("common.payFromAccount")}</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <input
            placeholder={t("expenses.billOrReason")}
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
          <button
            className="primary-btn"
            disabled={saving || !form.amount}
            onClick={saveExpense}
          >
            {saving ? t("common.saving") : t("expenses.add")}
          </button>
        </div>
        {previewGst.base > 0 && (
          <p className="gst-preview">
            {t("expenses.previewLine", {
              base: formatMoney(previewGst.base),
              gst: formatMoney(previewGst.gst),
              total: formatMoney(previewGst.total),
            })}
          </p>
        )}
      </div>

      <div className="expense-table payment-ledger">
        <h3>{t("expenses.ledgerTitle")}</h3>

        {expenses.length === 0 ? (
          <p className="empty">{t("expenses.empty")}</p>
        ) : (
          <div className="ledger-scroll">
            <table>
              <thead>
                <tr>
                  <th>{t("expenses.paidAt")}</th>
                  <th>{t("common.type")}</th>
                  <th>{t("common.vendor")}</th>
                  <th>{t("expenses.billOrReason")}</th>
                  <th>{t("expenses.baseAmount")}</th>
                  <th>{t("expenses.gstPercent")}</th>
                  <th>{t("expenses.gstAmount")}</th>
                  <th>{t("expenses.totalAfterGst")}</th>
                  <th>{t("expenses.paymentMode")}</th>
                  <th>{t("expenses.paidFrom")}</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => {
                  const base = baseAmountOf(e);
                  const gst = Number(e.gstAmount || 0);
                  return (
                    <tr key={e.id}>
                      <td>{formatDateTime(e.date)}</td>
                      <td>{e.type}</td>
                      <td>{e.vendor?.name || "—"}</td>
                      <td>{e.description || "—"}</td>
                      <td>{formatMoney(base)}</td>
                      <td>{e.gstRate ? `${e.gstRate}%` : "—"}</td>
                      <td>{gst ? formatMoney(gst) : "—"}</td>
                      <td>
                        <strong>{formatMoney(Number(e.amount || 0))}</strong>
                      </td>
                      <td>{e.paymentMode || "—"}</td>
                      <td>{e.bankAccount?.name || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
