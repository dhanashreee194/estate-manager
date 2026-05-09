import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  getProjectExpenses,
  getProjectExpenseReport,
} from "../../../api/expense";

import "../projects.css";

export default function ExpensesPage() {
  const { projectId } = useParams();

  const [expenses, setExpenses] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    getProjectExpenseReport(projectId).then(setSummary);
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;

    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [list, report] = await Promise.all([
        getProjectExpenses(projectId!),
        getProjectExpenseReport(projectId!),
      ]);

      setExpenses(list);
      setSummary(report);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading expenses...</div>;
  }

  return (
    <div className="expenses-page">
      {/* 🔹 Summary Cards */}
      <div className="expense-summary">
        <div className="summary-card">
          <h4>Total Cost</h4>
          <p>₹ {summary?.totalCost ?? 0}</p>
        </div>

        <div className="summary-card">
          <h4>Material</h4>
          <p>₹ {summary?.breakdown?.MATERIAL ?? 0}</p>
        </div>

        <div className="summary-card">
          <h4>Labour</h4>
          <p>₹ {summary?.breakdown?.LABOUR ?? 0}</p>
        </div>

        <div className="summary-card">
          <h4>Other</h4>
          <p>₹ {summary?.breakdown?.OTHER ?? 0}</p>
        </div>
      </div>

      {/* 🔹 Expense Table */}
      <div className="expense-table">
        <h3>📄 Expense List</h3>

        {expenses.length === 0 ? (
          <p className="empty">No expenses yet</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>

            <tbody>
              {expenses.map((e, i) => (
                <tr key={i}>
                  <td>{new Date(e.date).toLocaleDateString()}</td>

                  <td>{e.category}</td>

                  <td>{e.description}</td>

                  <td>₹ {e.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
