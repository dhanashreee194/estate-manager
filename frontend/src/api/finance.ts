import api from "./axios";

export type BankAccount = {
  id: string;
  name: string;
  accountType: "BANK" | "CASH" | "UPI" | "OTHER";
  bankName?: string | null;
  accountNumber?: string | null;
  ifsc?: string | null;
  openingBalance: number;
  balance: number;
  isDefault: boolean;
  isActive: boolean;
  notes?: string | null;
};

export const getFinanceSummary = () =>
  api.get("/finance/summary").then((r) => r.data);

export const getBankAccounts = (all = false) =>
  api
    .get("/finance/accounts", { params: all ? { all: "1" } : undefined })
    .then((r) => r.data);

export const createBankAccount = (data: {
  name: string;
  accountType?: string;
  bankName?: string;
  accountNumber?: string;
  ifsc?: string;
  openingBalance?: number;
  isDefault?: boolean;
  notes?: string;
}) => api.post("/finance/accounts", data).then((r) => r.data);

export const updateBankAccount = (id: string, data: any) =>
  api.patch(`/finance/accounts/${id}`, data).then((r) => r.data);

export const deactivateBankAccount = (id: string) =>
  api.delete(`/finance/accounts/${id}`).then((r) => r.data);

export const getCashbook = (filters?: {
  bankAccountId?: string;
  projectId?: string;
  type?: string;
  category?: string;
  from?: string;
  to?: string;
}) => api.get("/finance/cashbook", { params: filters }).then((r) => r.data);

export const createCashbookEntry = (data: {
  bankAccountId: string;
  type: "CREDIT" | "DEBIT";
  amount: number;
  category?: string;
  date?: string;
  description?: string;
  reference?: string;
  projectId?: string;
}) => api.post("/finance/cashbook", data).then((r) => r.data);

export const transferFunds = (data: {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date?: string;
  description?: string;
  reference?: string;
}) => api.post("/finance/transfer", data).then((r) => r.data);
