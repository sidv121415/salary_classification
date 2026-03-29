import React, { useEffect, useState } from 'react';

export default function HeatmapChartComponent({ dataPath }) {
  const [data, setData] = useState({ columns: [], matrix: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(dataPath)
      .then((res) => res.json())
      .then((json) => {
        setData({
          columns: json.columns || [],
          matrix: json.matrix || []
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [dataPath]);

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  const { columns, matrix } = data;
  if (!matrix.length) return <div>No data found.</div>;

  // Blue for positive (+), Rose for negative (-)
  const getColor = (value) => {
    const intensity = Math.min(Math.abs(value), 1);
    if (value > 0.1) {
      // 14 165 233 is #0ea5e9
      return `rgba(14, 165, 233, ${Math.max(0.1, intensity)})`;
    } else if (value < -0.1) {
      // 244 63 94 is #f43f5e
      return `rgba(244, 63, 94, ${Math.max(0.1, intensity)})`;
    }
    return `rgba(241, 245, 249, 1)`; // slate-100 neutral
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '130px', flexShrink: 0 }}></div>
        {columns.map((col, i) => (
          <div key={`header-${i}`} style={{ flex: 1, minWidth: '40px', paddingBottom: '0.5rem', textAlign: 'center', fontSize: '11px', color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }} title={col}>
            {col.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </div>
        ))}
      </div>
      
      {matrix.map((row, i) => (
        <div key={`row-${i}`} style={{ display: 'flex', flex: 1 }}>
          <div style={{ width: '130px', flexShrink: 0, textAlign: 'right', paddingRight: '1rem', alignSelf: 'center', fontSize: '11px', color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }} title={columns[i]}>
            {columns[i].split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </div>
          {row.map((val, j) => (
            <div 
              key={`cell-${i}-${j}`} 
              className="heatmap-cell"
              style={{ 
                flex: 1, 
                backgroundColor: getColor(val),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                color: Math.abs(val) > 0.4 ? '#ffffff' : '#334155',
                fontWeight: val === 1 ? '700' : '500',
                borderRadius: '4px',
                margin: '1px'
              }}
              title={`${columns[i]} vs ${columns[j]}: ${val.toFixed(3)}`}
            >
              {val === 1 ? '1' : val.toFixed(2)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
