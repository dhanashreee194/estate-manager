import FloorGrid from "./FloorGrid";

export default function WingAccordion({ wing }: { wing: string }) {
  return (
    <details className="wing-accordion">
      <summary>Wing {wing}</summary>

      <FloorGrid />
    </details>
  );
}
