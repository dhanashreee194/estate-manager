import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getMaterials } from "../../api/inventory";
import MaterialForm from "./MaterialForm";
import MaterialTable from "./MaterialTable";
import "./inventory.css";

export default function CompanyInventory() {
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["materials"],
    queryFn: getMaterials,
  });

  return (
    <div className="inventory-page">
      <section className="page-hero">
        <div className="page-hero-header">
          <div>
            <h1 className="page-title">Company Inventory</h1>
            <p className="page-subtitle">
              Manage company-wide materials and base costs
            </p>
          </div>

          <div className="inventory-cta">
            <button
              className="primary-btn add-btn"
              onClick={() => setOpen(true)}
            >
              + Add Material
            </button>
          </div>
        </div>
      </section>

      <section className="page-section">
        {isLoading ? (
          <p>Loading materials...</p>
        ) : (
          <MaterialTable materials={data || []} />
        )}
      </section>

      {open && <MaterialForm onClose={() => setOpen(false)} />}
    </div>
  );
}
