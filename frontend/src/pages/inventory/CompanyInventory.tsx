import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getMaterials } from "../../api/inventory";
import MaterialForm from "./MaterialForm";
import MaterialTable from "./MaterialTable";
import "./inventory.css";

export default function CompanyInventory() {
  const { t } = useTranslation();
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
            <h1 className="page-title">{t("inventory.companyTitle")}</h1>
            <p className="page-subtitle">{t("inventory.companyHint")}</p>
          </div>

          <div className="inventory-cta">
            <button
              className="primary-btn add-btn"
              onClick={() => setOpen(true)}
            >
              {t("inventory.addMaterial")}
            </button>
          </div>
        </div>
      </section>

      <section className="page-section">
        {isLoading ? (
          <p>{t("inventory.loadingMaterials")}</p>
        ) : (
          <MaterialTable materials={data || []} />
        )}
      </section>

      {open && <MaterialForm onClose={() => setOpen(false)} />}
    </div>
  );
}
