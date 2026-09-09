import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
} from "recharts";

const Chart = ({ data, color }: { data: any[]; color: string }) => (
  <ResponsiveContainer width="100%" height={120}>
    <LineChart data={data}>
      <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />

      <XAxis
        dataKey="date"
        stroke="var(--text-muted)"
        tickFormatter={(v) => {
          const d = new Date(v);
          return `${d.getDate()}/${d.getMonth() + 1}`;
        }}
      />

      <YAxis stroke="var(--text-muted)" tickFormatter={(v) => `₹${v}`} />

      <Line dataKey="amount" stroke={color} strokeWidth={2} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

export default Chart;
