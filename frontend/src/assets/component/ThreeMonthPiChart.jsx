import React from 'react';
import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";


const data = [
  { name: "Income (Last 3 Months)", value: 65 },
  { name: "Expenses (Last 3 Months)", value: 35 },
];

const COLORS = ["rgb(120, 102, 202)", "rgb(202, 106, 106)"];

const ThreeMonthPiChart = () => {
  return (
    <div className="wrapper  flex items-center justify-center p-6 w-full max-w-md mx-auto">
      <h2 className=" font-semibold text-white text-center ">
        Income vs Expenses 
      </h2>
      <div className="w-144 h-144 mt-10">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={250}
              label={({ value }) => `${value}%`}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>

            <Tooltip />
            <Legend
              verticalAlign="bottom"
              wrapperStyle={{ color: "white" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default ThreeMonthPiChart