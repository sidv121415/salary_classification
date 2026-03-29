import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AreaDensityChartComponent({ dataPath, arrayKey, binsCount = 30, color = '#166534', xAxisLabel = "Value", isLogScale = false }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper formatter to convert log salaries to beautiful Dollar strings
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  useEffect(() => {
    fetch(dataPath)
      .then((res) => res.json())
      .then((json) => {
        const rawArray = json[arrayKey];
        if (!Array.isArray(rawArray)) return;

        const validValues = rawArray.filter(v => typeof v === 'number' && !isNaN(v));
        if (validValues.length === 0) return;

        const min = Math.min(...validValues);
        const max = Math.max(...validValues);
        const binSize = (max - min) / binsCount;

        const bins = Array(binsCount).fill(0).map((_, i) => {
          const rawLower = min + i * binSize;
          const rawUpper = min + (i + 1) * binSize;
          
          let displayRange;
          let displayName;
          
          if (isLogScale) {
            // Transform Math.exp for natural logs (10.5 -> $36,000)
            const realLower = Math.exp(rawLower);
            const realUpper = Math.exp(rawUpper);
            displayRange = `${formatCurrency(realLower)} to ${formatCurrency(realUpper)}`;
            // Shorten name for X-Axis (e.g. "$36k")
            displayName = `$${(realLower/1000).toFixed(0)}k`;
          } else {
            displayRange = `${rawLower.toFixed(1)} to ${rawUpper.toFixed(1)}`;
            displayName = `${rawLower.toFixed(1)}`;
          }

          return {
            name: displayName,
            displayRange: displayRange,
            count: 0
          };
        });

        validValues.forEach(val => {
          let binIndex = Math.floor((val - min) / binSize);
          if (binIndex >= binsCount) binIndex = binsCount - 1;
          bins[binIndex].count += 1;
        });

        setData(bins);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading density data:", err);
        setLoading(false);
      });
  }, [dataPath, arrayKey, binsCount, isLogScale]);

  if (loading) return <div className="loading-wrapper">Processing density curves...</div>;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-title">Density Bracket: {payload[0].payload.displayRange}</p>
          <div className="tooltip-row">
            <span>Volume Observed:</span>
            <span className="tooltip-val" style={{ color: color }}>{payload[0].value} observations</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
        <defs>
          <linearGradient id={`colorDensity-${arrayKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
            <stop offset="95%" stopColor={color} stopOpacity={0.0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
        <XAxis 
          dataKey="name" 
          stroke="#a8a29e" 
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
          minTickGap={40}
          label={{ value: xAxisLabel, position: 'insideBottom', offset: -15, fill: '#78716c', fontSize: 12 }} 
        />
        <YAxis 
          stroke="#a8a29e" 
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(0,0,0,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
        <Area 
          type="monotone" 
          dataKey="count" 
          stroke={color} 
          strokeWidth={3}
          fillOpacity={1} 
          fill={`url(#colorDensity-${arrayKey})`} 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
