import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const TestChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <XAxis dataKey="month" stroke="#fff" />
      <YAxis stroke="#fff" />
      <Tooltip />
      <Legend />
      <Bar dataKey="income" fill="#2f00ffff" />
      <Bar dataKey="expense" fill="#ff0000ff" />
    </BarChart>
  </ResponsiveContainer>
);
