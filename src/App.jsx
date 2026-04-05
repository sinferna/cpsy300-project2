import { useState } from 'react'
import Page2 from './Page2'

const charts = [
  { title: 'Bar Chart', description: 'Average macronutrient content by diet type.', image: '/bar_chart.png' },
  { title: 'Scatter Plot', description: 'Nutrient relationships (e.g., protein vs carbs).', image: '/scatter_plot.png' },
  { title: 'Heatmap', description: 'Nutrient correlations.', image: '/heatmap.png' },
  { title: 'Pie Chart', description: 'Recipe distribution by diet type.', image: '/pie_chart.png' },
]

const dietTypes = ['All Diet Types', 'keto', 'vegan', 'paleo', 'mediterranean', 'dash']

const btnStyle = (bg) => ({ backgroundColor: bg, color: '#d8f3dc', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' })

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
  const [dataPage, setDataPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [insights, setInsights] = useState(null)
  const [recipes, setRecipes] = useState(null)
  const [clusters, setClusters] = useState(null)
  const [loading, setLoading] = useState('')

  const dietParam = selectedDiet !== 'All Diet Types' ? `diet_type=${selectedDiet}` : ''

  const fetchInsights = async () => {
    setLoading('insights')
    try {
      const res = await fetch(`/api/insights?${dietParam}`)
      const data = await res.json()
      setInsights(data)
      setRecipes(null)
      setClusters(null)
    } catch (err) {
      console.error(err)
    }
    setLoading('')
  }

  const fetchRecipes = async (page = dataPage) => {
    setLoading('recipes')
    try {
      const params = new URLSearchParams({ page, limit: 10 })
      if (selectedDiet !== 'All Diet Types') params.set('diet_type', selectedDiet)
      if (search.trim()) params.set('search', search.trim())
      const res = await fetch(`/api/recipes?${params}`)
      const data = await res.json()
      setRecipes(data)
      setTotalPages(data.totalPages)
      setInsights(null)
      setClusters(null)
    } catch (err) {
      console.error(err)
    }
    setLoading('')
  }

  const fetchClusters = async () => {
    setLoading('clusters')
    try {
      const res = await fetch('/api/clusters')
      const data = await res.json()
      setClusters(data)
      setInsights(null)
      setRecipes(null)
    } catch (err) {
      console.error(err)
    }
    setLoading('')
  }

  const handlePageChange = (page) => {
    setDataPage(page)
    fetchRecipes(page)
  }

  // Show max 5 page buttons around current page
  const getPageButtons = () => {
    const pages = []
    let start = Math.max(1, dataPage - 2)
    let end = Math.min(totalPages, start + 4)
    start = Math.max(1, end - 4)
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }
  const pageButtons = getPageButtons()

  const navTotalPages = 2

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
            onKeyDown={(e) => { if (e.key === 'Enter') { setDataPage(1); fetchRecipes(1) } }}
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
          <button onClick={fetchInsights} disabled={loading === 'insights'} style={btnStyle('#2d6a4f')}>
            {loading === 'insights' ? 'Loading...' : 'Get Nutritional Insights'}
          </button>
          <button onClick={() => { setDataPage(1); fetchRecipes(1) }} disabled={loading === 'recipes'} style={btnStyle('#1a7a4a')}>
            {loading === 'recipes' ? 'Loading...' : 'Get Recipes'}
          </button>
          <button onClick={fetchClusters} disabled={loading === 'clusters'} style={btnStyle('#4a7c59')}>
            {loading === 'clusters' ? 'Loading...' : 'Get Clusters'}
          </button>
        </div>

        {/* API Results */}
        {insights && (
          <div style={{ marginBottom: '40px', overflowX: 'auto' }}>
            <h3 style={{ color: '#b7e4c7', marginBottom: '12px' }}>Nutritional Insights {selectedDiet !== 'All Diet Types' ? `— ${selectedDiet}` : ''}</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', tableLayout: 'fixed' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #2d6a4f' }}>
                  <th style={{ textAlign: 'left', padding: '8px', color: '#74c69d' }}>Diet Type</th>
                  <th style={{ textAlign: 'right', padding: '8px', color: '#74c69d' }}>Avg Protein (g)</th>
                  <th style={{ textAlign: 'right', padding: '8px', color: '#74c69d' }}>Avg Carbs (g)</th>
                  <th style={{ textAlign: 'right', padding: '8px', color: '#74c69d' }}>Avg Fat (g)</th>
                </tr>
              </thead>
              <tbody>
                {insights.map((row) => (
                  <tr key={row.diet_type} style={{ borderBottom: '1px solid #1b2e27' }}>
                    <td style={{ padding: '8px' }}>{row.diet_type}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>{row.avg_protein}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>{row.avg_carbs}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>{row.avg_fat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {recipes && (
          <div style={{ marginBottom: '40px', overflowX: 'auto' }}>
            <h3 style={{ color: '#b7e4c7', marginBottom: '4px' }}>Recipes (Page {recipes.page} of {recipes.totalPages})</h3>
            <p style={{ color: '#74c69d', fontSize: '13px', marginBottom: '12px' }}>{recipes.total} total results</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', tableLayout: 'fixed' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #2d6a4f' }}>
                  <th style={{ textAlign: 'left', padding: '8px', color: '#74c69d', width: '35%' }}>Recipe</th>
                  <th style={{ textAlign: 'left', padding: '8px', color: '#74c69d', width: '13%' }}>Diet</th>
                  <th style={{ textAlign: 'left', padding: '8px', color: '#74c69d', width: '16%' }}>Cuisine</th>
                  <th style={{ textAlign: 'right', padding: '8px', color: '#74c69d', width: '12%' }}>Protein</th>
                  <th style={{ textAlign: 'right', padding: '8px', color: '#74c69d', width: '12%' }}>Carbs</th>
                  <th style={{ textAlign: 'right', padding: '8px', color: '#74c69d', width: '12%' }}>Fat</th>
                </tr>
              </thead>
              <tbody>
                {recipes.data.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #1b2e27' }}>
                    <td style={{ padding: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.recipe_name}</td>
                    <td style={{ padding: '8px' }}>{r.diet_type}</td>
                    <td style={{ padding: '8px' }}>{r.cuisine_type}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>{r.protein_g}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>{r.carbs_g}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>{r.fat_g}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {clusters && (
          <div style={{ marginBottom: '40px', overflowX: 'auto' }}>
            <h3 style={{ color: '#b7e4c7', marginBottom: '12px' }}>Clusters (k={clusters.k})</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', tableLayout: 'fixed' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #2d6a4f' }}>
                  <th style={{ textAlign: 'left', padding: '8px', color: '#74c69d' }}>Cluster</th>
                  <th style={{ textAlign: 'right', padding: '8px', color: '#74c69d' }}>Avg Protein (g)</th>
                  <th style={{ textAlign: 'right', padding: '8px', color: '#74c69d' }}>Avg Carbs (g)</th>
                  <th style={{ textAlign: 'right', padding: '8px', color: '#74c69d' }}>Avg Fat (g)</th>
                  <th style={{ textAlign: 'right', padding: '8px', color: '#74c69d' }}>Recipes</th>
                </tr>
              </thead>
              <tbody>
                {clusters.centroids.map((c) => (
                  <tr key={c.cluster} style={{ borderBottom: '1px solid #1b2e27' }}>
                    <td style={{ padding: '8px' }}>Cluster {c.cluster}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>{c.protein_g}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>{c.carbs_g}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>{c.fat_g}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>{clusters.data.filter(r => r.cluster === c.cluster).length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Data Pagination (for recipes) */}
        {recipes && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '14px', color: '#b7e4c7' }}>Data Pagination</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => handlePageChange(Math.max(1, dataPage - 1))}
                style={paginationBtn(false)}
              >
                Previous
              </button>
              {pageButtons.map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  style={paginationBtn(dataPage === page)}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(Math.min(totalPages, dataPage + 1))}
                style={paginationBtn(false)}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Page Navigation */}
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
            onClick={() => setCurrentPage((p) => Math.min(navTotalPages, p + 1))}
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
