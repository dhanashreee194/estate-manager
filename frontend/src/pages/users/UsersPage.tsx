import { useEffect, useState } from "react";
import { getCustomers } from "../../api/customer";
import EditCustomerModal from "./EditCustomerModal";

export default function UsersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editCustomer, setEditCustomer] = useState<any>(null);
  const load = async () => {
    try {
      const res = await getCustomers();
      setCustomers(res);
    } catch (err) {
      console.error("Failed to load customers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <div style={{ padding: 20 }}>Loading customers...</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Customers</h2>

      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Address</th>
          </tr>
        </thead>

        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.phone}</td>
              <td>{c.email || "-"}</td>
              <td>{c.address || "-"}</td>
              <td>
                <button onClick={() => setEditCustomer(c)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <EditCustomerModal
        customer={editCustomer}
        onClose={() => setEditCustomer(null)}
        onSaved={load}
      />
    </div>
  );
}
