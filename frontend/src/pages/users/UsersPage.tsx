// import { useEffect, useState } from "react";
// import { getCustomers } from "../../api/customer";
// import EditCustomerModal from "./EditCustomerModal";

// export default function UsersPage() {
//   const [customers, setCustomers] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [editCustomer, setEditCustomer] = useState<any>(null);
//   const load = async () => {
//     try {
//       const res = await getCustomers();
//       setCustomers(res);
//     } catch (err) {
//       console.error("Failed to load customers", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//   }, []);

//   if (loading) {
//     return <div style={{ padding: 20 }}>Loading customers...</div>;
//   }

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>Customers</h2>

//       <table className="table">
//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>Phone</th>
//             <th>Email</th>
//             <th>Address</th>
//           </tr>
//         </thead>

//         <tbody>
//           {customers.map((c) => (
//             <tr key={c.id}>
//               <td>{c.name}</td>
//               <td>{c.phone}</td>
//               <td>{c.email || "-"}</td>
//               <td>{c.address || "-"}</td>
//               <td>
//                 <button onClick={() => setEditCustomer(c)}>Edit</button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//       <EditCustomerModal
//         customer={editCustomer}
//         onClose={() => setEditCustomer(null)}
//         onSaved={load}
//       />
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getCustomers } from "../../api/customer";
import EditCustomerModal from "./EditCustomerModal";
import { useNavigate } from "react-router-dom";
export default function CustomersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [editCustomer, setEditCustomer] = useState<any>(null);

  const load = async () => {
    try {
      setLoading(true);

      const res = await getCustomers(search);

      setCustomers(res);
    } catch (err) {
      console.error("Failed to load customers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [search]);

  if (loading) {
    return <div style={{ padding: 20 }}>{t("users.loading")}</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
          alignItems: "center",
        }}
      >
        {/* <h2>Customers</h2> */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <h2>{t("users.customers")}</h2>

          <button
            onClick={() =>
              setEditCustomer({
                name: "",
                phone: "",
                email: "",
                address: "",
                panNumber: "",
                aadharNumber: "",
              })
            }
          >
            {t("users.addCustomer")}
          </button>
        </div>
        <input
          placeholder={t("users.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: 10,
            width: 250,
          }}
        />
      </div>

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
              <td>{c.email || "-"}</td>
              <td>{c.panNumber || "-"}</td>
              <td>{c.aadharNumber || "-"}</td>

              <td>
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                  }}
                >
                  <button onClick={() => navigate(`/customers/${c.id}`)}>
                    {t("common.view")}
                  </button>

                  <button onClick={() => setEditCustomer(c)}>{t("common.edit")}</button>
                </div>
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
