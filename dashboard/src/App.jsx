import React, { useState } from 'react';
import { LayoutDashboard, BarChart2, Network, Building2, PanelLeftClose, PanelRightClose } from 'lucide-react';

// Components
import BarChartComponent from './components/BarChartComponent';
import AreaDensityChartComponent from './components/AreaDensityChartComponent';
import ScatterChartComponent from './components/ScatterChartComponent';
import CorrelationBarComponent from './components/CorrelationBarComponent';
import BoxPlotComponent from './components/BoxPlotComponent';
import IncomeBoxPlotComponent from './components/IncomeBoxPlotComponent';
import BubbleChartComponent from './components/BubbleChartComponent';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { id: 'overview', label: 'Salary Structure Analysis', icon: <LayoutDashboard size={18} /> },
    { id: 'distributions', label: 'Distributions', icon: <BarChart2 size={18} /> },
    { id: 'relationships', label: 'Relationships', icon: <Network size={18} /> },
    { id: 'companies', label: 'Company Profiles', icon: <Building2 size={18} /> },
  ];

  /* ---------------- Views ---------------- */
  
  const OverviewView = () => (
    <div className="content-grid">
      <div className="solid-card col-3">
        <div className="card-subtitle" style={{marginBottom: 0}}>Total Observations</div>
        <div className="metric-val">25,241</div>
      </div>
      <div className="solid-card col-3">
        <div className="card-subtitle" style={{marginBottom: 0}}>Model Salary Base</div>
        <div className="metric-val">$84.2k</div>
        <div style={{color: '#57534e', fontSize: '0.8125rem'}}>Median Inference Benchmark</div>
      </div>
      <div className="solid-card col-3">
        <div className="card-subtitle" style={{marginBottom: 0}}>Average Rating</div>
        <div className="metric-val">3.9 / 5</div>
        <div style={{color: '#57534e', fontSize: '0.8125rem'}}>Weighted Corporate Mean</div>
      </div>
      <div className="solid-card col-3">
        <div className="card-subtitle" style={{marginBottom: 0}}>Top Factor</div>
        <div className="metric-val" style={{fontSize: '1.75rem'}}>Job Security</div>
        <div style={{color: '#9a3412', fontSize: '0.8125rem'}}>12% of total complaints</div>
      </div>

      <div className="solid-card col-12">
        <div className="card-title">Factors Driving Company Reputation</div>
        <div className="card-subtitle">
          Instead of a complex Multicollinearity Matrix, this breakdown isolated exactly which structured hiring metadata (like benefits, interview structures, or financial compensation volumes) directly corresponds with a positive or negative overall Company Rating.
        </div>
        <div className="chart-container" style={{height: '350px'}}>
          <CorrelationBarComponent dataPath="/data/correlation_heatmap.json" targetVariable="rating" />
        </div>
      </div>
    </div>
  );

  const DistributionsView = () => (
    <div className="content-grid">
      <div className="solid-card col-12">
        <div className="card-title">Salary Estimate Density</div>
        <div className="card-subtitle">Global distribution curve analyzing income distribution across diverse corporate roles and institutional tiers. Transformed from base-log models to absolute monetary volume.</div>
        <div className="chart-container chart-container-tall">
          <AreaDensityChartComponent 
            dataPath="/data/salary_distribution_log.json" 
            arrayKey="values"
            binsCount={35}
            color="#166534" /* Forest Green */
            xAxisLabel="Annual Compensation (USD)"
            isLogScale={true}
          />
        </div>
      </div>
      <div className="solid-card col-12">
        <div className="card-title">Rating Density</div>
        <div className="card-subtitle">Volume stratification of company ratings.</div>
        <div className="chart-container chart-container-tall">
          <AreaDensityChartComponent 
            dataPath="/data/rating_distribution.json" 
            arrayKey="values"
            binsCount={25}
            color="#b45309" /* Muted Gold */
            xAxisLabel="Rating Index (1.0 - 5.0)"
            isLogScale={false}
          />
        </div>
      </div>
      
      <div className="solid-card col-6">
        <div className="card-title">Income Distribution by Corporate Tier</div>
        <div className="card-subtitle">Mapping real monetary variance against institutional reputation clusters. *Compensating for missing raw 'Roles' data structurally.*</div>
        <div className="chart-container" style={{height: '380px'}}>
          <IncomeBoxPlotComponent dataPath="/data/salary_by_cluster.json" titleColor="#166534" />
        </div>
      </div>

      <div className="solid-card col-6">
        <div className="card-title">Income Distribution by Primary Frustration</div>
        <div className="card-subtitle">Do major complaint categories change depending on the salary brackets of the employees reporting them?</div>
        <div className="chart-container" style={{height: '380px'}}>
          <IncomeBoxPlotComponent dataPath="/data/salary_by_issue.json" titleColor="#9a3412" />
        </div>
      </div>
    </div>
  );

  const RelationshipsView = () => (
    <div className="content-grid">
      <div className="solid-card col-6">
        <div className="card-title">Engagement vs. Corporate Rating</div>
        <div className="card-subtitle">Assessing if higher baseline staff interaction translates to actual firm prestige.</div>
        <div className="chart-container">
          <ScatterChartComponent 
            dataPath="/data/engagement_vs_rating.json"
            xKey="x" yKey="y" xLabel="Engagement Score" yLabel="Rating" color="#1e3a8a" sampleSize={1000}
          />
        </div>
      </div>
      <div className="solid-card col-6">
        <div className="card-title">Estimated Salary vs. Rating</div>
        <div className="card-subtitle">Scatter mapping financial compensation against satisfaction profiles.</div>
        <div className="chart-container">
          <ScatterChartComponent 
            dataPath="/data/salary_vs_rating.json"
            xKey="x" yKey="y" xLabel="Base Log Salary" yLabel="Rating" color="#166534" sampleSize={1000}
          />
        </div>
      </div>
      <div className="solid-card col-6">
        <div className="card-title">Review Volume vs. Rating</div>
        <div className="card-subtitle">Does extreme volume of feedback universally pull averages toward the mean?</div>
        <div className="chart-container">
          <ScatterChartComponent 
            dataPath="/data/reviews_vs_rating.json"
            xKey="x" yKey="y" xLabel="Total Reviews Dumped" yLabel="Rating" color="#9a3412" sampleSize={1000}
          />
        </div>
      </div>
      <div className="solid-card col-6">
        <div className="card-title">Multivariable Interconnects</div>
        <div className="card-subtitle">Plotting cross-dimensional metadata correlations by scale mapping.</div>
        <div className="chart-container">
          <BubbleChartComponent 
             dataPath="/data/multivariable_scatter.json"
          />
        </div>
      </div>
    </div>
  );

  const CompanyProfilesView = () => (
    <div className="content-grid">
      {/* Expanded the 4-column donut into a sprawling full grid Bar Chart! */}
      <div className="solid-card col-12">
        <div className="card-title">Primary Employee Frustrations</div>
        <div className="card-subtitle">Analysis of the most frequently referenced critical complaints scraped from review bodies. Providing full horizontal width for absolute legibility of long-form issue structures.</div>
        <div className="chart-container" style={{height: '380px'}}>
          <BarChartComponent 
            dataPath="/data/top_issues.json" xKey="issue" yKey="count" colors={['#9a3412']} horizontal={true} valuePrefix="Issues: "
          />
        </div>
      </div>
      
      <div className="solid-card col-12">
        <div className="card-title">Rating Breakdown by Organizational Growth Tier</div>
        <div className="card-subtitle">Categorical range mapping demonstrating exactly how employee satisfaction brackets scale (or crash) as firms expand headcounts from 1K to 10K+. (Boxes display IQRs, Whiskers show specific boundaries).</div>
        <div className="chart-container" style={{height: '380px'}}>
          <BoxPlotComponent dataPath="/data/rating_vs_hiring_boxplot.json" />
        </div>
      </div>
      
      <div className="solid-card col-12">
        <div className="card-title">Top 20 Premier Ranked Organizations</div>
        <div className="card-subtitle">Firms achieving the highest collective average score globally. (*Dataset presently does not expose total reviews per firm; ranked strictly by pure average).</div>
        <div className="chart-container" style={{height: '400px'}}>
          <BarChartComponent 
            dataPath="/data/top_companies.json" xKey="company" yKey="rating" colors={['#166534']} horizontal={true} valuePrefix="Avg: "
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-layout">

      {sidebarOpen && (
        <aside className="sidebar">
          <nav className="sidebar-nav">
            {navItems.map(item => (
              <div 
                key={item.id} 
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                {item.icon}
                {item.label}
              </div>
            ))}
          </nav>
        </aside>
      )}

      <main className="main-content">
        <header className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button 
            style={{background: 'transparent', border: '1px solid #d6d3d1', color: '#1c1917', cursor: 'pointer', padding: '0.65rem', borderRadius: '4px'}}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title="Toggle Sidebar"
          >
            {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelRightClose size={20} />}
          </button>
          <div>
            <h1 className="page-title">{navItems.find(i => i.id === activeTab)?.label}</h1>
            <p className="page-subtitle">Standardized intelligence reports mapping corporate compensation infrastructure.</p>
          </div>
        </header>

        {activeTab === 'overview' && <OverviewView />}
        {activeTab === 'distributions' && <DistributionsView />}
        {activeTab === 'relationships' && <RelationshipsView />}
        {activeTab === 'companies' && <CompanyProfilesView />}
      </main>
    </div>
  );
}

export default App;
