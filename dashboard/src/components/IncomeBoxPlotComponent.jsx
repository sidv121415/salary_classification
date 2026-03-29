import React, { useEffect, useState } from 'react';
import { ComposedChart, Bar, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function IncomeBoxPlotComponent({ dataPath, titleColor = "#166534" }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  useEffect(() => {
    fetch(dataPath)
      .then((res) => res.json())
      .then((json) => {
        // json is precomputed limits: [{group: '...', min, q1, median, q3, max}]
        const processed = json.map(item => ({
            name: item.group,
            minMax: [item.min, item.max],
            iqr: [item.q1, item.q3],
            median: item.median,
            min: item.min,
            max: item.max,
            q1: item.q1,
            q3: item.q3
        }));
        
        // Sort by median ascending
        processed.sort((a, b) => a.median - b.median);
        
        setData(processed);
        setLoading(false);
      })
      .catch((err) => {
         console.error(err);
         setLoading(false);
      });
  }, [dataPath]);

  if (loading) return <div className="loading-wrapper">Processing Distribution Maps...</div>;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-title">{p.name} Cohort</p>
          <div className="tooltip-row">
            <span>Median Base:</span>
            <span className="tooltip-val" style={{color: titleColor}}>{formatCurrency(p.median)}</span>
          </div>
          <div className="tooltip-row">
            <span>Interquartile Range (Mid 50%):</span>
            <span className="tooltip-val" style={{color: '#9a3412'}}>{formatCurrency(p.q1)} - {formatCurrency(p.q3)}</span>
          </div>
          <div className="tooltip-row" style={{borderTop: '1px solid rgba(0,0,0,0.1)', marginTop: '0.5rem', paddingTop: '0.5rem'}}>
            <span>Absolute Spectrum Boundaries:</span>
            <span className="tooltip-val">{formatCurrency(p.min)} - {formatCurrency(p.max)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 30, right: 30, left: 20, bottom: 50 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
        <XAxis 
          dataKey="name" 
          stroke="#57534e" 
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 13, fontWeight: 500 }} 
          angle={-20}
          textAnchor="end"
        />
        <YAxis 
          stroke="#57534e" 
          domain={['auto', 'auto']}
          tickLine={false}
          axisLine={false}
          tickFormatter={(val) => '$' + (val / 1000).toFixed(0) + 'k'}
          tick={{ fontSize: 12 }} 
        />
        <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(0,0,0,0.02)'}} />
        
        {/* Whiskers */}
        <Bar dataKey="minMax" fill="rgba(120, 113, 108, 0.4)" barSize={4} />
        
        {/* IQR Block */}
        <Bar dataKey="iqr" fill={titleColor} fillOpacity={0.8} barSize={36} radius={2} />
        
        {/* Median Point */}
        <Scatter dataKey="median" fill="#fdfbf7" stroke="#1c1917" strokeWidth={2} />
        
      </ComposedChart>
    </ResponsiveContainer>
  );
}
