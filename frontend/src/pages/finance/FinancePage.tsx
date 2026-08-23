import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  createBankAccount,
  createCashbookEntry,
  deactivateBankAccount,
  getBankAccounts,
  getCashbook,
  getFinanceSummary,
  transferFunds,
  type BankAccount,
} from "../../api/finance";
import "./finance.css";

const ACCOUNT_TYPES = [
  { value: "BANK", labelKey: "finance.bank" },
  { value: "CASH", labelKey: "finance.cash" },
  { value: "UPI", labelKey: "finance.upi" },
  { value: "OTHER", labelKey: "bookings.other" },
];

const CATEGORIES = [
  "OTHER",
  "EXPENSE",
  "VENDOR_PAYMENT",
  "BROKER_COMMISSION",
  "LAND_PURCHASE",
  "JV_PAYOUT",
  "BOOKING_RECEIPT",
  "ADJUSTMENT",
];

const emptyAccount = {
  name: "",
  accountType: "BANK",
  bankName: "",
  accountNumber: "",
  ifsc: "",
  openingBalance: 0,
  isDefault: false,
};

const emptyEntry = {
  bankAccountId: "",
  type: "CREDIT" as "CREDIT" | "DEBIT",
  amount: 0,
  category: "OTHER",
  date: new Date().toISOString().slice(0, 10),
  description: "",
  reference: "",
};

const emptyTransfer = {
  fromAccountId: "",
  toAccountId: "",
  amount: 0,
  date: new Date().toISOString().slice(0, 10),
  description: "",
};

export default function FinancePage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [accountForm, setAccountForm] = useState(emptyAccount);
  const [entryForm, setEntryForm] = useState(emptyEntry);
  const [transferForm, setTransferForm] = useState(emptyTransfer);
  const [accountFilter, setAccountFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { data: summary } = useQuery({
    queryKey: ["finance-summary"],
    queryFn: getFinanceSummary,
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["bank-accounts"],
    queryFn: () => getBankAccounts(),
  });

  const cashbookFilters = useMemo(
    () => ({
      ...(accountFilter ? { bankAccountId: accountFilter } : {}),
      ...(typeFilter ? { type: typeFilter } : {}),
      ...(fromDate ? { from: fromDate } : {}),
      ...(toDate ? { to: toDate } : {}),
    }),
    [accountFilter, typeFilter, fromDate, toDate],
  );

  const { data: cashbook, isLoading } = useQuery({
    queryKey: ["cashbook", cashbookFilters],
    queryFn: () => getCashbook(cashbookFilters),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["finance-summary"] });
    qc.invalidateQueries({ queryKey: ["bank-accounts"] });
    qc.invalidateQueries({ queryKey: ["cashbook"] });
  };

  const createAccountMut = useMutation({
    mutationFn: createBankAccount,
    onSuccess: () => {
      setAccountForm(emptyAccount);
      invalidate();
    },
  });

  const deactivateMut = useMutation({
    mutationFn: deactivateBankAccount,
    onSuccess: invalidate,
  });

  const entryMut = useMutation({
    mutationFn: createCashbookEntry,
    onSuccess: () => {
      setEntryForm({
        ...emptyEntry,
        bankAccountId: entryForm.bankAccountId || accounts[0]?.id || "",
      });
      invalidate();
    },
  });

  const transferMut = useMutation({
    mutationFn: transferFunds,
    onSuccess: () => {
      setTransferForm(emptyTransfer);
      invalidate();
    },
  });

  const fmt = (n: number) =>
    `₹ ${(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  return (
    <div className="finance-page">
      <div className="finance-summary">
        <div className="summary-card">
          <h4>{t("finance.totalBalance")}</h4>
          <p>{fmt(summary?.totalBalance || 0)}</p>
        </div>
        <div className="summary-card in">
          <h4>{t("finance.todayIn")}</h4>
          <p>{fmt(summary?.todayIn || 0)}</p>
        </div>
        <div className="summary-card out">
          <h4>{t("finance.todayOut")}</h4>
          <p>{fmt(summary?.todayOut || 0)}</p>
        </div>
        <div className="summary-card">
          <h4>{t("finance.allAccounts")}</h4>
          <p>{summary?.accountCount || 0}</p>
        </div>
      </div>

      <div className="account-cards">
        {(accounts as BankAccount[]).map((a) => (
          <div key={a.id} className={`account-card type-${a.accountType.toLowerCase()}`}>
            <div className="account-card-top">
              <strong>{a.name}</strong>
              <span className="account-type">{a.accountType}</span>
            </div>
            <div className="account-balance">{fmt(a.balance)}</div>
            <div className="account-meta">
              {a.bankName || a.accountType}
              {a.isDefault ? ` · ${t("finance.defaultAccount")}` : ""}
            </div>
            <button
              type="button"
              className="link-danger"
              onClick={() => {
                if (confirm(t("common.deactivateConfirm", { name: a.name })))
                  deactivateMut.mutate(a.id);
              }}
            >
              {t("common.deactivate")}
            </button>
          </div>
        ))}
        {!accounts.length && (
          <div className="account-card empty">{t("finance.noAccounts")}</div>
        )}
      </div>

      <div className="finance-grid">
        <div className="page-card">
          <h3>{t("finance.addAccount")}</h3>
          <div className="form-grid">
            <input
              placeholder={t("finance.accountName")}
              value={accountForm.name}
              onChange={(e) =>
                setAccountForm({ ...accountForm, name: e.target.value })
              }
            />
            <select
              value={accountForm.accountType}
              onChange={(e) =>
                setAccountForm({ ...accountForm, accountType: e.target.value })
              }
            >
              {ACCOUNT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {t(type.labelKey)}
                </option>
              ))}
            </select>
            <input
              placeholder={t("finance.bankName")}
              value={accountForm.bankName}
              onChange={(e) =>
                setAccountForm({ ...accountForm, bankName: e.target.value })
              }
            />
            <input
              placeholder={t("finance.accountNumber")}
              value={accountForm.accountNumber}
              onChange={(e) =>
                setAccountForm({
                  ...accountForm,
                  accountNumber: e.target.value,
                })
              }
            />
            <input
              placeholder={t("finance.ifsc")}
              value={accountForm.ifsc}
              onChange={(e) =>
                setAccountForm({ ...accountForm, ifsc: e.target.value })
              }
            />
            <input
              type="number"
              placeholder={t("finance.openingBalance")}
              value={accountForm.openingBalance}
              onChange={(e) =>
                setAccountForm({
                  ...accountForm,
                  openingBalance: Number(e.target.value),
                })
              }
            />
            <label className="check-label">
              <input
                type="checkbox"
                checked={accountForm.isDefault}
                onChange={(e) =>
                  setAccountForm({
                    ...accountForm,
                    isDefault: e.target.checked,
                  })
                }
              />
              {t("finance.defaultAccount")}
            </label>
            <button
              className="primary"
              disabled={!accountForm.name || createAccountMut.isPending}
              onClick={() =>
                createAccountMut.mutate({
                  name: accountForm.name,
                  accountType: accountForm.accountType,
                  bankName: accountForm.bankName || undefined,
                  accountNumber: accountForm.accountNumber || undefined,
                  ifsc: accountForm.ifsc || undefined,
                  openingBalance: Number(accountForm.openingBalance) || 0,
                  isDefault: accountForm.isDefault,
                })
              }
            >
              {t("finance.createAccount")}
            </button>
          </div>
        </div>

        <div className="page-card">
          <h3>{t("finance.addEntry")}</h3>
          <div className="form-grid">
            <select
              value={entryForm.bankAccountId}
              onChange={(e) =>
                setEntryForm({ ...entryForm, bankAccountId: e.target.value })
              }
            >
              <option value="">{t("finance.fromAccount")}</option>
              {accounts.map((a: BankAccount) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <select
              value={entryForm.type}
              onChange={(e) =>
                setEntryForm({
                  ...entryForm,
                  type: e.target.value as "CREDIT" | "DEBIT",
                })
              }
            >
              <option value="CREDIT">{t("finance.inCredit")}</option>
              <option value="DEBIT">{t("finance.outDebit")}</option>
            </select>
            <input
              type="number"
              placeholder={t("finance.amountRequired")}
              value={entryForm.amount || ""}
              onChange={(e) =>
                setEntryForm({ ...entryForm, amount: Number(e.target.value) })
              }
            />
            <select
              value={entryForm.category}
              onChange={(e) =>
                setEntryForm({ ...entryForm, category: e.target.value })
              }
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={entryForm.date}
              onChange={(e) =>
                setEntryForm({ ...entryForm, date: e.target.value })
              }
            />
            <input
              placeholder={t("finance.refChequeUtr")}
              value={entryForm.reference}
              onChange={(e) =>
                setEntryForm({ ...entryForm, reference: e.target.value })
              }
            />
            <input
              placeholder={t("common.description")}
              value={entryForm.description}
              onChange={(e) =>
                setEntryForm({ ...entryForm, description: e.target.value })
              }
            />
            <button
              className="primary"
              disabled={
                !entryForm.bankAccountId ||
                !entryForm.amount ||
                entryMut.isPending
              }
              onClick={() =>
                entryMut.mutate({
                  bankAccountId: entryForm.bankAccountId,
                  type: entryForm.type,
                  amount: Number(entryForm.amount),
                  category: entryForm.category,
                  date: entryForm.date,
                  description: entryForm.description || undefined,
                  reference: entryForm.reference || undefined,
                })
              }
            >
              {t("finance.postEntry")}
            </button>
          </div>
        </div>

        <div className="page-card">
          <h3>{t("finance.transferBetween")}</h3>
          <div className="form-grid">
            <select
              value={transferForm.fromAccountId}
              onChange={(e) =>
                setTransferForm({
                  ...transferForm,
                  fromAccountId: e.target.value,
                })
              }
            >
              <option value="">{t("finance.fromAccount")}</option>
              {accounts.map((a: BankAccount) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <select
              value={transferForm.toAccountId}
              onChange={(e) =>
                setTransferForm({
                  ...transferForm,
                  toAccountId: e.target.value,
                })
              }
            >
              <option value="">{t("finance.toAccount")}</option>
              {accounts.map((a: BankAccount) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder={t("finance.amountRequired")}
              value={transferForm.amount || ""}
              onChange={(e) =>
                setTransferForm({
                  ...transferForm,
                  amount: Number(e.target.value),
                })
              }
            />
            <input
              type="date"
              value={transferForm.date}
              onChange={(e) =>
                setTransferForm({ ...transferForm, date: e.target.value })
              }
            />
            <input
              placeholder={t("finance.note")}
              value={transferForm.description}
              onChange={(e) =>
                setTransferForm({
                  ...transferForm,
                  description: e.target.value,
                })
              }
            />
            <button
              className="primary"
              disabled={
                !transferForm.fromAccountId ||
                !transferForm.toAccountId ||
                !transferForm.amount ||
                transferMut.isPending
              }
              onClick={() =>
                transferMut.mutate({
                  fromAccountId: transferForm.fromAccountId,
                  toAccountId: transferForm.toAccountId,
                  amount: Number(transferForm.amount),
                  date: transferForm.date,
                  description: transferForm.description || undefined,
                })
              }
            >
              {t("finance.transfer")}
            </button>
          </div>
        </div>
      </div>

      <div className="page-card">
        <div className="toolbar">
          <h3>{t("finance.title")}</h3>
          <div className="filters">
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
            >
              <option value="">{t("finance.allAccounts")}</option>
              {accounts.map((a: BankAccount) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">{t("finance.inOut")}</option>
              <option value="CREDIT">{t("finance.inOnly")}</option>
              <option value="DEBIT">{t("finance.outOnly")}</option>
            </select>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>

        <div className="cashbook-totals">
          <span>
            {t("finance.in")}: <strong className="credit">{fmt(cashbook?.totals?.credits || 0)}</strong>
          </span>
          <span>
            {t("finance.out")}: <strong className="debit">{fmt(cashbook?.totals?.debits || 0)}</strong>
          </span>
          <span>
            {t("finance.net")}: <strong>{fmt(cashbook?.totals?.net || 0)}</strong>
          </span>
        </div>

        {isLoading ? (
          <p>{t("common.loading")}</p>
        ) : (
          <div className="cashbook-table">
            <div className="cashbook-row head">
              <span>{t("common.date")}</span>
              <span>{t("finance.allAccounts")}</span>
              <span>{t("common.category")}</span>
              <span>{t("common.description")}</span>
              <span>{t("finance.in")}</span>
              <span>{t("finance.out")}</span>
              <span>{t("common.balance")}</span>
            </div>
            {(cashbook?.entries || []).map((e: any) => (
              <div key={e.id} className="cashbook-row">
                <span>{new Date(e.date).toLocaleDateString("en-IN")}</span>
                <span>{e.bankAccount?.name}</span>
                <span>{(e.category || "").replace(/_/g, " ")}</span>
                <span>
                  {e.description || "—"}
                  {e.reference ? ` (${e.reference})` : ""}
                  {e.project?.name ? ` · ${e.project.name}` : ""}
                </span>
                <span className="credit">
                  {e.type === "CREDIT" ? fmt(e.amount) : ""}
                </span>
                <span className="debit">
                  {e.type === "DEBIT" ? fmt(e.amount) : ""}
                </span>
                <span>{fmt(e.balanceAfter)}</span>
              </div>
            ))}
            {!cashbook?.entries?.length && (
              <p className="empty-hint">{t("finance.noEntries")}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
