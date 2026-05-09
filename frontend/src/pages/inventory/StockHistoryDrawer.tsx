import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getInwardHistory, getOutwardHistory } from "../../api/inventory";

export default function StockHistoryDrawer({
  material,
  onClose,
}: {
  material: any;
  onClose: () => void;
}) {
  const { projectId } = useParams();

  const { data: inward } = useQuery({
    queryKey: ["inward", projectId, material.materialId],
    queryFn: () => getInwardHistory(projectId!, material.materialId),
  });

  const { data: outward } = useQuery({
    queryKey: ["outward", projectId, material.materialId],
    queryFn: () => getOutwardHistory(projectId!, material.materialId),
  });

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h3>{material.material.name}</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <section>
          <h4>Inward</h4>
          {inward?.length ? (
            inward.map((i: any) => (
              <div key={i.id} className="history-row inward">
                + {i.quantity} {material.material.unit}
              </div>
            ))
          ) : (
            <p className="muted">No inward entries</p>
          )}
        </section>

        <section>
          <h4>Outward</h4>
          {outward?.length ? (
            outward.map((o: any) => (
              <div key={o.id} className="history-row outward">
                − {o.quantity} {material.material.unit}
              </div>
            ))
          ) : (
            <p className="muted">No outward entries</p>
          )}
        </section>
      </div>
    </div>
  );
}
