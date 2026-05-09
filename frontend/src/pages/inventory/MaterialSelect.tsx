import { useQuery } from "@tanstack/react-query";
import { getMaterials } from "../../api/inventory";

type Props = {
  value?: string;
  onChange: (id: string) => void;
};

export default function MaterialSelect({ value, onChange }: Props) {
  const { data = [], isLoading } = useQuery({
    queryKey: ["materials"],
    queryFn: getMaterials,
  });

  if (isLoading) return <p>Loading materials...</p>;

  return (
    <select value={value || ""} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select material</option>
      {data.map((m) => (
        <option key={m.id} value={m.id}>
          {m.name} ({m.unit})
        </option>
      ))}
    </select>
  );
}
