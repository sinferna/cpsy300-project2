import { useState } from 'react'
import Page2 from './Page2'

const charts = [
  { title: 'Bar Chart', description: 'Average macronutrient content by diet type.', image: '/bar_chart.png' },
  { title: 'Scatter Plot', description: 'Nutrient relationships (e.g., protein vs carbs).', image: '/scatter_plot.png' },
  { title: 'Heatmap', description: 'Nutrient correlations.', image: '/heatmap.png' },
  { title: 'Pie Chart', description: 'Recipe distribution by diet type.', image: '/pie_chart.png' },
]

const dietTypes = ['All Diet Types', 'Keto', 'Vegan', 'Paleo', 'Mediterranean', 'Vegetarian']

// ── Pagination button style helper ─────────────────────────────────────────
function paginationBtn(active) {
  return {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #2d6a4f',
    backgroundColor: active ? '#2d6a4f' : '#1b2e27',
    color: active ? '#d8f3dc' : '#b7e4c7',
    fontWeight: active ? '700' : '400',
    cursor: 'pointer',
    fontSize: '14px',
  }
}

function Page1({ currentPage, setCurrentPage }) {
  const [search, setSearch] = useState('')
  const [selectedDiet, setSelectedDiet] = useState('All Diet Types')
  const totalPages = 2

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0f1f1a', fontFamily: "'Segoe UI', sans-serif", color: '#e8f5e9' }}>

      {/* Header */}
      <header style={{ backgroundColor: '#1b4332', padding: '18px 36px', borderBottom: '2px solid #2d6a4f' }}>
        <h1 style={{ color: '#b7e4c7', margin: 0, fontSize: '22px', fontWeight: '700', letterSpacing: '0.5px' }}>🥗 Nutritional Insights</h1>
      </header>

      {/* Main */}
      <main style={{ flex: 1, padding: '36px' }}>

        {/* Chart Cards */}
        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#b7e4c7' }}>Explore Nutritional Insights</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '40px' }}>
          {charts.map((chart) => (
            <div key={chart.title} style={{
              backgroundColor: '#1b2e27',
              borderRadius: '12px',
              padding: '18px',
              minHeight: '240px',
              border: '1px solid #2d6a4f',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>
                {chart.image
                  ? <img src={chart.image} alt={chart.title} style={{ width: '100%', borderRadius: '8px' }} />
                  : chart.icon
                }
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: '700', color: '#b7e4c7' }}>{chart.title}</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#74c69d' }}>{chart.description}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '14px', color: '#b7e4c7' }}>Filters and Data Interaction</h2>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '36px' }}>
          <input
            type="text"
            placeholder="Search by Diet Type"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '9px 14px',
              borderRadius: '8px',
              border: '1px solid #2d6a4f',
              fontSize: '14px',
              width: '220px',
              backgroundColor: '#1b2e27',
              color: '#e8f5e9',
              outline: 'none',
            }}
          />
          <select
            value={selectedDiet}
            onChange={(e) => setSelectedDiet(e.target.value)}
            style={{
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid #2d6a4f',
              fontSize: '14px',
              backgroundColor: '#1b2e27',
              color: '#e8f5e9',
              cursor: 'pointer',
            }}
          >
            {dietTypes.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* API Buttons */}
        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '14px', color: '#b7e4c7' }}>API Data Interaction</h2>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
          <button style={{ backgroundColor: '#2d6a4f', color: '#d8f3dc', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
            Get Nutritional Insights
          </button>
          <button style={{ backgroundColor: '#1a7a4a', color: '#d8f3dc', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
            Get Recipes
          </button>
          <button style={{ backgroundColor: '#4a7c59', color: '#d8f3dc', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
            Get Clusters
          </button>
        </div>

        {/* Pagination */}
        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '14px', color: '#b7e4c7' }}>Pagination</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            style={paginationBtn(false)}
          >
            Previous
          </button>
          {[1, 2].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              style={paginationBtn(currentPage === page)}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            style={paginationBtn(false)}
          >
            Next
          </button>
        </div>

      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: '#1b4332', padding: '16px', textAlign: 'center', borderTop: '2px solid #2d6a4f' }}>
        <p style={{ color: '#74c69d', margin: 0, fontSize: '14px' }}>© 2025 Nutritional Insights. All Rights Reserved.</p>
      </footer>

    </div>
  )
}

export default function App() {
  const [currentPage, setCurrentPage] = useState(1)

  if (currentPage === 2) {
    return <Page2 currentPage={currentPage} setCurrentPage={setCurrentPage} />
  }

  return <Page1 currentPage={currentPage} setCurrentPage={setCurrentPage} />
}