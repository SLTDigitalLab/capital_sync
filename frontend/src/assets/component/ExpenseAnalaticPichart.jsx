import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#0353A4", "#024A93", "#013F82", "#013472","#012A5F"];

const ExpenseAnalaticPichart = ({totalTransportation,totalBills,totalFoodandDrink,totalHealth,totalHousing}) => {

    const data = [
  { name: "Bills & Utilities", value: totalBills },
  { name: "Food & Drinks", value: totalFoodandDrink},
  { name: "health & Medicals", value: totalHealth},
  {name: "Housing", value: totalHousing},
  {name: "Transportations", value: totalTransportation },
  ];

  return (
    <div >
          
    
          <div className="w-100 h-84 bg-gray-500/8 rounded border-3xl flex justify-center items-center mb-10 ">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label
                >
                  {data.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
  )
}

export default ExpenseAnalaticPichart