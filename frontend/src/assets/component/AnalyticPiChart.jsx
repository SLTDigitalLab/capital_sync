
import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";




const COLORS = ["#8080FF", "#6666E6", "#4D4DCC", "#3333B3" , "#1A1A99"];

const AnalyticPiChart = ({totalSalary,totalBusinessIncome,totalFreelance,totalInvestment,totalOthers}) => {

    const data = [
  { name: "Salary", value: totalSalary },
  { name: "Freelance", value: totalFreelance },
  { name: "Business Income", value: totalBusinessIncome },
  {name: "Investment", value: totalInvestment },
  {name: "Others", value: totalOthers },
  ];
  

  return (
    <div >
      

      <div className="w-100 h-84 bg-gray-500/8 rounded border-3xl flex justify-center items-center mb-10">
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

export default AnalyticPiChart