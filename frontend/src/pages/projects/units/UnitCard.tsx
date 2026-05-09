export default function UnitCard({
  number,
  bhk,
  facing,
}: {
  number: string;
  bhk: string;
  facing: string;
}) {
  return (
    <div className="unit-card available">
      <strong>{number}</strong>
      <span>{bhk}</span>
      <span>{facing}</span>
    </div>
  );
}
