import React, { useEffect, useState } from 'react';
import { ComposedChart, Bar, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Helper to compute quartiles
const asc = arr => arr.sort((a, b) => a - b);
const quantile = (arr, q) => {
  const sorted = asc(arr);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
};

export default function BoxPlotComponent({ dataPath, formatType="standard" }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add formatting
  const formatValue = (val) => {
    if (formatType === "currency") {
       return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
    }
    return val;
  };

  useEffect(() => {
    fetch(dataPath)
      .then((res) => res.json())
      .then((json) => {
        const processed = Object.keys(json).map(key => {
          const arr = json[key].filter(v => typeof v === 'number');
          if (arr.length === 0) return null;
          
          const min = Math.min(...arr);
          const max = Math.max(...arr);
          const q1 = quantile(arr, 0.25);
          const median = quantile(arr, 0.50);
          const q3 = quantile(arr, 0.75);
          
          return {
            name: key,
            minMax: [min, max],
            iqr: [q1, q3],
            median: median,
            min: min,
            max: max,
            q1: q1,
            q3: q3,
            samples: arr.length
          };
        }).filter(Boolean);
        
        // Sort by samples to make it look neat
        processed.sort((a, b) => b.samples - a.samples);
        
        setData(processed);
        setLoading(false);
      })
      .catch((err) => {
         console.error(err);
         setLoading(false);
      });
  }, [dataPath]);

  if (loading) return <div className="loading-wrapper"><div className="spin-ring"></div></div>;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-title">Company Size: {p.name}</p>
          <div className="tooltip-row">
            <span>Median Score:</span>
            <span className="tooltip-val" style={{color: '#f43f5e'}}>{p.median.toFixed(2)}</span>
          </div>
          <div className="tooltip-row">
            <span>IQR Range (Mid 50%):</span>
            <span className="tooltip-val" style={{color: '#3b82f6'}}>{p.q1.toFixed(2)} - {p.q3.toFixed(2)}</span>
          </div>
          <div className="tooltip-row">
            <span>Total Range:</span>
            <span className="tooltip-val">{p.min.toFixed(2)} - {p.max.toFixed(2)}</span>
          </div>
          <div className="tooltip-row" style={{borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '0.25rem', paddingTop: '0.25rem'}}>
            <span>Profiles Observed:</span>
            <span className="tooltip-val">{p.samples}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
        <XAxis 
          dataKey="name" 
          stroke="#94a3b8" 
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }} 
        />
        <YAxis 
          stroke="#94a3b8" 
          domain={['auto', 'auto']}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }} 
        />
        <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.02)'}} />
        
        {/* The thin line representing total range (whiskers) */}
        <Bar dataKey="minMax" fill="rgba(148, 163, 184, 0.3)" barSize={2} />
        
        {/* The thick block representing IQR (Q1 to Q3) */}
        <Bar dataKey="iqr" fill="#3b82f6" fillOpacity={0.8} barSize={24} radius={2} />
        
        {/* The dot for the Median */}
        <Scatter dataKey="median" fill="#f43f5e" />
        
      </ComposedChart>
    </ResponsiveContainer>
  );
}
