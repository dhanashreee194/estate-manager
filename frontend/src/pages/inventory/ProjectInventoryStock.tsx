import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProjectStock } from "../../api/inventory";
import { useState } from "react";
import StockHistoryDrawer from "./StockHistoryDrawer";

const MAX_STOCK = 200;

export default function ProjectInventoryStock() {
  const { projectId } = useParams();
  const [selected, setSelected] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["project-stock", projectId],
    queryFn: () => getProjectStock(projectId!),
    enabled: !!projectId,
  });

  if (isLoading) return <p>Loading stock...</p>;
  if (!data?.length) return <p className="empty-state">No stock available</p>;

  return (
    <div className="stock-grid">
      {data.map((item: any) => {
        const percent = Math.min(
          Math.round((item.quantity / MAX_STOCK) * 100),
          100,
        );

        const status =
          item.quantity < 30
            ? "critical"
            : item.quantity < 80
              ? "low"
              : "healthy";

        return (
          <div
            key={item.materialId}
            className="stock-card"
            onClick={() => setSelected(item)}
          >
            <div className="stock-card-header">
              <span className="stock-material">{item.material.name}</span>
              <span className={`stock-status ${status}`}>{status}</span>
            </div>

            <div className="stock-bar">
              <div
                className={`stock-bar-fill ${status}`}
                style={{ width: `${percent}%` }}
              />
            </div>

            <div className="stock-quantity">
              {item.quantity}
              <span className="stock-unit">{item.material.unit}</span>
            </div>

            <div className="stock-meta">Available stock</div>
            {selected && (
              <StockHistoryDrawer
                material={selected}
                onClose={() => setSelected(null)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
