import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function DonutChartComponent({ dataPath, xKey = 'issue', yKey = 'count' }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Professional color palette for pie slices
  const COLORS = ['#2563EB', '#6366F1', '#8B5CF6', '#D946EF', '#F43F5E', '#F59E0B', '#10B981', '#14B8A6', '#0EA5E9', '#64748B'];

  useEffect(() => {
    fetch(dataPath)
      .then((res) => res.json())
      .then((json) => {
        if (!json[xKey] || !json[yKey]) return;
        
        const formattedData = json[xKey].map((xValue, index) => ({
          name: xValue,
          value: json[yKey][index]
        }));
        setData(formattedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading data:", err);
        setLoading(false);
      });
  }, [dataPath, xKey, yKey]);

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
        <div className="custom-tooltip animate-slide-up" style={{maxWidth: '280px', whiteSpace: 'normal'}}>
          <p className="tooltip-label" style={{borderBottom: 'none'}}>{payload[0].name}</p>
          <div className="tooltip-item" style={{justifyContent: 'flex-start', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem'}}>
            <span style={{ color: payload[0].payload.fill, fontWeight: 700, fontSize: '1.25rem' }}>
              {payload[0].value}
            </span>
            <span>mentions</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={80}
          outerRadius={110}
          paddingAngle={4}
          dataKey="value"
          stroke="none"
          cornerRadius={6}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          layout="horizontal" 
          verticalAlign="bottom" 
          align="center"
          wrapperStyle={{ fontSize: '11px', color: '#64748b' }}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
