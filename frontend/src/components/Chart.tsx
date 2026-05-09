import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
} from "recharts";

const Chart = ({ data, color }: any) => (
  <ResponsiveContainer width="100%" height={160}>
    <LineChart data={data}>
      <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />

      <XAxis
        dataKey="date"
        stroke="#6b7280"
        tickFormatter={(v) => {
          const d = new Date(v);
          return `${d.getDate()}/${d.getMonth() + 1}`;
        }}
      />

      <YAxis stroke="#6b7280" tickFormatter={(v) => `₹${v}`} />

      <Line dataKey="amount" stroke={color} strokeWidth={2} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

export default Chart;
