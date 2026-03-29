import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function HistogramChartComponent({ dataPath, arrayKey, binsCount = 20, colors = ['#f43f5e', '#ef4444'], xAxisLabel = "Value" }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(dataPath)
      .then((res) => res.json())
      .then((json) => {
        const rawArray = json[arrayKey];
        if (!Array.isArray(rawArray)) {
          console.error("Invalid array for histogram generation.", rawArray);
          return;
        }

        const validValues = rawArray.filter(v => typeof v === 'number' && !isNaN(v));
        if (validValues.length === 0) return;

        const min = Math.min(...validValues);
        const max = Math.max(...validValues);
        // compute bins
        const binSize = (max - min) / binsCount;

        const bins = Array(binsCount).fill(0).map((_, i) => ({
          name: `${(min + i * binSize).toFixed(1)} - ${(min + (i + 1) * binSize).toFixed(1)}`,
          rangeStart: min + i * binSize,
          rangeEnd: min + (i + 1) * binSize,
          count: 0
        }));

        validValues.forEach(val => {
          let binIndex = Math.floor((val - min) / binSize);
          if (binIndex >= binsCount) binIndex = binsCount - 1; // max inclusive
          bins[binIndex].count += 1;
        });

        setData(bins);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading data:", err);
        setLoading(false);
      });
  }, [dataPath, arrayKey, binsCount]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <span>Calculating Bins...</span>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip animate-fade-in">
          <p className="tooltip-label">Range: {payload[0].payload.name}</p>
          <div className="tooltip-item">
            <span>Frequency:</span>
            <span style={{ color: colors[0], fontWeight: 600 }}>{payload[0].value}</span>
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
        margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
        barCategoryGap={2}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis 
          dataKey="name" 
          stroke="#64748b" 
          tick={false} 
          label={{ value: xAxisLabel, position: 'insideBottom', offset: -20, fill: '#64748b', fontSize: 13 }} 
        />
        <YAxis stroke="#64748b" tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
        <Bar dataKey="count">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={`url(#histoGradient-${arrayKey})`} />
          ))}
        </Bar>
        <defs>
          <linearGradient id={`histoGradient-${arrayKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors[0]} stopOpacity={0.9} />
            <stop offset="100%" stopColor={colors[1] || colors[0]} stopOpacity={0.6} />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
}
