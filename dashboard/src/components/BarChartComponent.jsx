import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

export default function BarChartComponent({ dataPath, xKey, yKey, colors = ['#166534'], horizontal = false, valuePrefix='' }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(dataPath)
      .then((res) => res.json())
      .then((json) => {
        if (!json[xKey] || !json[yKey]) return;
        
        let formattedData = json[xKey].map((xValue, index) => ({
          name: xValue,
          value: json[yKey][index]
        }));
        
        if (horizontal) {
          formattedData.sort((a, b) => a.value - b.value); // default asc for bottom up
        }
        setData(formattedData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [dataPath, xKey, yKey, horizontal]);

  if (loading) return <div className="loading-wrapper">Loading bar data...</div>;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-title">{payload[0].payload.name}</p>
          <div className="tooltip-row">
            <span>Volume/Score:</span>
            <span className="tooltip-val" style={{ color: colors[0] }}>{valuePrefix}{payload[0].value}</span>
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
        layout={horizontal ? "vertical" : "horizontal"}
        margin={{ top: 10, right: 50, left: horizontal ? 240 : 0, bottom: horizontal ? 0 : 70 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" horizontal={!horizontal} vertical={horizontal} />
        {horizontal ? (
          <>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" stroke="#1c1917" width={230} tick={{ fontSize: 13, fontWeight: 500 }} axisLine={false} tickLine={false} />
          </>
        ) : (
          <>
            <XAxis dataKey="name" stroke="#1c1917" angle={-45} textAnchor="end" height={90} tick={{ fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
            <YAxis hide />
          </>
        )}
        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} content={<CustomTooltip />} />
        <Bar dataKey="value" radius={horizontal ? [0, 2, 2, 0] : [2, 2, 0, 0]} fill={colors[0]}>
          <LabelList 
            dataKey="value" 
            position={horizontal ? "right" : "top"} 
            fill="#57534e" 
            fontSize={12} 
            fontWeight={600} 
            formatter={(v) => v >= 1000 ? `${valuePrefix}${(v/1000).toFixed(1)}k` : `${valuePrefix}${v}`}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
