import React, { useEffect, useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function BubbleChartComponent({ dataPath }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(dataPath)
      .then((res) => res.json())
      .then((json) => {
        if (!json.x || !json.y) return;
        
        let formattedData = json.x.map((xValue, index) => ({
          x: xValue,
          y: json.y[index],
          z: json.size ? json.size[index] : 1,
          color: json.color ? json.color[index] : 1
        }));

        // Downsample to 1000 items to prevent lag (if array is massive)
        if (formattedData.length > 800) {
          const step = Math.ceil(formattedData.length / 800);
          formattedData = formattedData.filter((_, idx) => idx % step === 0);
        }

        setData(formattedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading data:", err);
        setLoading(false);
      });
  }, [dataPath]);

  if (loading) return <div className="loading-wrapper"><div className="spin-ring"></div></div>;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-title">Multivariable Node</p>
          <div className="tooltip-row">
            <span>Factor X:</span>
            <span className="tooltip-val" style={{color: '#6366f1'}}>{Number(payload[0].value).toFixed(2)}</span>
          </div>
          <div className="tooltip-row">
            <span>Factor Y:</span>
            <span className="tooltip-val" style={{color: '#10b981'}}>{Number(payload[1].value).toFixed(2)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis 
          type="number" 
          dataKey="x" 
          name="Factor X" 
          stroke="#94a3b8" 
          tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}
          tick={{ fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis 
          type="number" 
          dataKey="y" 
          name="Factor Y" 
          stroke="#94a3b8" 
          tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}
          tick={{ fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <ZAxis type="number" dataKey="z" range={[10, 200]} name="Volume" />
        <Tooltip cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.2)' }} content={<CustomTooltip />} />
        
        <Scatter name="Multivariate" data={data}>
          {data.map((entry, index) => {
            // Very simple color mapping: if entry.color > median, hot. Else cool.
            // But realistically just use a nice gradient based on the array length.
            const colorRatio = (entry.color || index) / (data.length - 1 || 1);
            let fill = `hsl(${200 + colorRatio * 100}, 80%, 65%)`; // Blue to Pink scale
            return <Cell key={`cell-${index}`} fill={fill} opacity={0.6} />;
          })}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}
