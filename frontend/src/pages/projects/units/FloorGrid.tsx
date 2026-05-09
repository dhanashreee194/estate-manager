import UnitCard from "./UnitCard";

export default function FloorGrid() {
  const floors = [10, 9, 8, 7];

  return (
    <div className="floor-grid">
      {floors.map((floor) => (
        <div key={floor} className="floor-row">
          <span className="floor-label">Floor {floor}</span>

          <div className="units-row">
            <UnitCard number="101" bhk="2 BHK" facing="East" />
            <UnitCard number="102" bhk="3 BHK" facing="West" />
            <UnitCard number="103" bhk="2 BHK" facing="North" />
          </div>
        </div>
      ))}
    </div>
  );
}
