import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

export default function CorrelationBarComponent({ dataPath, targetVariable = "rating" }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(dataPath)
      .then((res) => res.json())
      .then((json) => {
        const targetIndex = json.columns.indexOf(targetVariable);
        if (targetIndex === -1) return;

        const row = json.matrix[targetIndex];
        const formattedData = json.columns.map((col, i) => {
          if (i === targetIndex) return null; // Skip self correlation (1.0)
          
          return {
            name: col.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            value: row[i]
          };
        }).filter(Boolean);

        // Sort by magnitude
        formattedData.sort((a, b) => b.value - a.value);

        setData(formattedData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [dataPath, targetVariable]);

  if (loading) return <div className="loading-wrapper">Loading correlation matrices...</div>;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      const influence = val > 0 ? "Positive Correlation" : "Negative Correlation";
      const color = val > 0 ? "#166534" : "#9a3412"; // Forest or Rust
      
      return (
        <div className="custom-tooltip">
          <p className="tooltip-title">{payload[0].payload.name}</p>
          <div className="tooltip-row">
            <span>Impact on {targetVariable.charAt(0).toUpperCase() + targetVariable.slice(1)}:</span>
            <span className="tooltip-val" style={{ color: color }}>{val.toFixed(4)} ({influence})</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
        <XAxis type="number" stroke="#a8a29e" tick={{ fontSize: 11 }} tickFormatter={(v) => v.toFixed(2)} axisLine={false} tickLine={false} />
        <YAxis dataKey="name" type="category" stroke="#1c1917" width={110} tick={{ fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} content={<CustomTooltip />} />
        <ReferenceLine x={0} stroke="#1c1917" strokeWidth={1} />
        <Bar dataKey="value" barSize={24} radius={[0, 2, 2, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#166534' : '#9a3412'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
