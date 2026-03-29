import React, { useEffect, useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ScatterChartComponent({ dataPath, xKey = "x", yKey = "y", color = "#6366f1", xLabel="X", yLabel="Y", sampleSize=1000 }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(dataPath)
      .then((res) => res.json())
      .then((json) => {
        if (!json[xKey] || !json[yKey]) return;
        
        let formattedData = json[xKey].map((xValue, index) => ({
          x: xValue,
          y: json[yKey][index]
        }));

        if (sampleSize && formattedData.length > sampleSize) {
          const step = Math.ceil(formattedData.length / sampleSize);
          formattedData = formattedData.filter((_, idx) => idx % step === 0);
        }

        setData(formattedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading data:", err);
        setLoading(false);
      });
  }, [dataPath, xKey, yKey, sampleSize]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip animate-slide-up text-sm">
          <p className="tooltip-label">Observed Profile</p>
          <div className="tooltip-item">
            <span>{xLabel}:</span>
            <span style={{ color: color, fontWeight: 700 }}>{Number(payload[0].value).toFixed(2)}</span>
          </div>
          <div className="tooltip-item">
            <span>{yLabel}:</span>
            <span style={{ color: color, fontWeight: 700 }}>{Number(payload[1].value).toFixed(2)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis 
          type="number" 
          dataKey="x" 
          name={xLabel} 
          stroke="#94a3b8" 
          tick={{ fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}
          label={{ value: xLabel, position: 'insideBottom', offset: -15, fill: '#64748b', fontSize: 12, fontWeight: 500 }}
          domain={['auto', 'auto']}
        />
        <YAxis 
          type="number" 
          dataKey="y" 
          name={yLabel} 
          stroke="#94a3b8" 
          tick={{ fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}
          label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 15, fill: '#64748b', fontSize: 12, fontWeight: 500 }}
          domain={['auto', 'auto']}
        />
        <Tooltip cursor={{ strokeDasharray: '3 3', stroke: '#e2e8f0' }} content={<CustomTooltip />} />
        <Scatter name="Data" data={data} fill={color} opacity={0.3} lineType="joint" />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
