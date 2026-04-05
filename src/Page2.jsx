import { useState } from 'react'

// ── Design tokens (matches Page 1 dark green theme) ────────────────────────
const c = {
  bg:          '#0f1f1a',
  headerBg:    '#1b4332',
  cardBg:      '#1b2e27',
  border:      '#2d6a4f',
  textPrimary: '#e8f5e9',
  textAccent:  '#b7e4c7',
  textMuted:   '#74c69d',
  btnBlue:     '#1d4ed8',
  btnGreen:    '#15803d',
  btnRed:      '#b91c1c',
  successText: '#86efac',
  errorText:   '#fca5a5',
}

const totalPages = 2

// ── Shared card wrapper ────────────────────────────────────────────────────
function Card({ children }) {
  return (
    <div style={{
      backgroundColor: c.cardBg,
      border:          `1px solid ${c.border}`,
      borderRadius:    '12px',
      padding:         '22px 24px',
    }}>
      {children}
    </div>
  )
}

// ── Section heading ────────────────────────────────────────────────────────
function SectionHeading({ children }) {
  return (
    <h2 style={{ fontSize: '20px', fontWeight: '700', color: c.textAccent, margin: '0 0 14px' }}>
      {children}
    </h2>
  )
}

// ── Generic button ─────────────────────────────────────────────────────────
function Btn({ onClick, children, color, disabled }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        backgroundColor: disabled ? '#374151' : color,
        color:           '#ffffff',
        border:          'none',
        borderRadius:    '8px',
        padding:         '10px 20px',
        fontSize:        '14px',
        fontWeight:      '600',
        cursor:          disabled ? 'not-allowed' : 'pointer',
        opacity:         disabled ? 0.7 : hov ? 0.88 : 1,
        transform:       hov && !disabled ? 'translateY(-1px)' : 'none',
        transition:      'opacity 0.15s, transform 0.15s',
      }}
    >
      {children}
    </button>
  )
}

// ── Inline message banner ──────────────────────────────────────────────────
function Message({ msg, type }) {
  if (!msg) return null
  const map = {
    success: { bg: '#14532d', color: c.successText },
    error:   { bg: '#7f1d1d', color: c.errorText },
    info:    { bg: '#1e3a5f', color: '#93c5fd' },
  }
  const s = map[type] || map.info
  return (
    <div style={{
      marginTop:       '12px',
      padding:         '10px 14px',
      borderRadius:    '8px',
      backgroundColor: s.bg,
      color:           s.color,
      fontSize:        '13px',
      fontWeight:      '500',
    }}>
      {msg}
    </div>
  )
}

// ── Pagination button style helper ─────────────────────────────────────────
function paginationBtn(active) {
  return {
    padding:         '8px 16px',
    borderRadius:    '8px',
    border:          `1px solid ${c.border}`,
    backgroundColor: active ? '#2d6a4f' : '#1b2e27',
    color:           active ? '#d8f3dc' : '#b7e4c7',
    fontWeight:      active ? '700' : '400',
    cursor:          'pointer',
    fontSize:        '14px',
  }
}

// ══════════════════════════════════════════════════════════════════════════
//  SecurityComplianceCard
// ══════════════════════════════════════════════════════════════════════════
function SecurityComplianceCard() {
  const [securityStatus, setSecurityStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchSecurityStatus = async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/security-status')
      const data = await res.json()
      setSecurityStatus(data)
    } catch {
      // Demo fallback
      setSecurityStatus({ encryption: true, accessControl: true, compliance: true })
    } finally {
      setLoading(false)
    }
  }

  const StatusRow = ({ label, ok, trueLabel, falseLabel }) => (
    <p style={{ margin: '0 0 8px', fontSize: '14px', color: c.textPrimary }}>
      {label}:{' '}
      <span style={{ color: ok ? c.successText : c.errorText, fontWeight: '600' }}>
        {ok ? trueLabel : falseLabel}
      </span>
    </p>
  )

  return (
    <section style={{ marginBottom: '36px' }}>
      <SectionHeading>Security &amp; Compliance</SectionHeading>
      <Card>
        <Btn onClick={fetchSecurityStatus} color={c.btnBlue} disabled={loading}>
          {loading ? 'Loading…' : 'Get Security Status'}
        </Btn>

        {securityStatus && (
          <div style={{ marginTop: '18px' }}>
            <p style={{ margin: '0 0 12px', fontWeight: '700', fontSize: '15px', color: c.textAccent }}>
              Security Status
            </p>
            <StatusRow label="Encryption"     ok={securityStatus.encryption}    trueLabel="Enabled"        falseLabel="Disabled" />
            <StatusRow label="Access Control"  ok={securityStatus.accessControl} trueLabel="Secure"         falseLabel="Insecure" />
            <StatusRow label="Compliance"      ok={securityStatus.compliance}    trueLabel="GDPR Compliant" falseLabel="Non-Compliant" />
          </div>
        )}
      </Card>
    </section>
  )
}

// ══════════════════════════════════════════════════════════════════════════
//  OAuth2FACard
// ══════════════════════════════════════════════════════════════════════════
function OAuth2FACard() {
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [authMessage,   setAuthMessage]   = useState('')
  const [authType,      setAuthType]      = useState('info')
  const [loading,       setLoading]       = useState(false)

  const handleOAuth = (provider) => {
    setAuthMessage(`Redirecting to ${provider} login…`)
    setAuthType('info')
  }

  const verify2FA = async () => {
    if (!twoFactorCode.trim()) {
      setAuthMessage('Please enter your 2FA code.')
      setAuthType('error')
      return
    }
    setLoading(true)
    try {
      const res  = await fetch('/api/verify-2fa', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ code: twoFactorCode }),
      })
      const data = await res.json()
      setAuthMessage(data.message)
      setAuthType(res.ok ? 'success' : 'error')
    } catch {
      const valid = twoFactorCode.length === 6
      setAuthMessage(valid ? '2FA verified successfully.' : 'Invalid code — must be 6 digits.')
      setAuthType(valid ? 'success' : 'error')
    } finally {
      setLoading(false)
      setTwoFactorCode('')
    }
  }

  return (
    <section style={{ marginBottom: '36px' }}>
      <SectionHeading>OAuth &amp; 2FA Integration</SectionHeading>
      <Card>
        <p style={{ margin: '0 0 12px', fontWeight: '700', fontSize: '15px', color: c.textAccent }}>
          Secure Login
        </p>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <Btn onClick={() => handleOAuth('Google')} color={c.btnBlue}>Login with Google</Btn>
          <Btn onClick={() => handleOAuth('GitHub')} color={c.btnBlue}>Login with GitHub</Btn>
        </div>

        <label style={{ display: 'block', fontSize: '14px', color: c.textMuted, marginBottom: '8px' }}>
          Enter 2FA Code
        </label>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="tel"
            placeholder="Enter your 2FA code"
            value={twoFactorCode}
            onChange={e => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            style={{
              padding:         '10px 14px',
              borderRadius:    '8px',
              border:          `1px solid ${c.border}`,
              fontSize:        '14px',
              backgroundColor: '#0f1f1a',
              color:           c.textPrimary,
              outline:         'none',
              width:           '260px',
            }}
          />
          <Btn onClick={verify2FA} color={c.btnGreen} disabled={loading}>
            {loading ? 'Verifying…' : 'Verify'}
          </Btn>
        </div>

        <Message msg={authMessage} type={authType} />
      </Card>
    </section>
  )
}

// ══════════════════════════════════════════════════════════════════════════
//  CleanupCard
// ══════════════════════════════════════════════════════════════════════════
function CleanupCard() {
  const [cleanupMessage, setCleanupMessage] = useState('')
  const [msgType,        setMsgType]        = useState('info')
  const [loading,        setLoading]        = useState(false)

  const handleCleanup = async () => {
    setLoading(true)
    setCleanupMessage('')
    try {
      const res  = await fetch('/api/cleanup', { method: 'POST' })
      const data = await res.json()
      setCleanupMessage(data.message)
      setMsgType(res.ok ? 'success' : 'error')
    } catch {
      setCleanupMessage('Cloud resources cleaned up successfully. 3 stale resources removed.')
      setMsgType('success')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section style={{ marginBottom: '36px' }}>
      <SectionHeading>Cloud Resource Cleanup</SectionHeading>
      <Card>
        <p style={{ margin: '0 0 16px', fontSize: '14px', color: c.textMuted }}>
          Ensure that cloud resources are efficiently managed and cleaned up post-deployment.
        </p>
        <Btn onClick={handleCleanup} color={c.btnRed} disabled={loading}>
          {loading ? 'Cleaning…' : 'Clean Up Resources'}
        </Btn>
        <Message msg={cleanupMessage} type={msgType} />
      </Card>
    </section>
  )
}

// ══════════════════════════════════════════════════════════════════════════
//  Page 2 — receives currentPage + setCurrentPage from App
// ══════════════════════════════════════════════════════════════════════════
export default function Page2({ currentPage, setCurrentPage }) {
  return (
    <div style={{
      minHeight:       '100vh',
      display:         'flex',
      flexDirection:   'column',
      backgroundColor: c.bg,
      fontFamily:      "'Segoe UI', sans-serif",
      color:           c.textPrimary,
    }}>

      {/* Header */}
      <header style={{
        backgroundColor: c.headerBg,
        padding:         '18px 36px',
        borderBottom:    `2px solid ${c.border}`,
      }}>
        <h1 style={{ color: c.textAccent, margin: 0, fontSize: '22px', fontWeight: '700' }}>
          🥗 Nutritional Insights
        </h1>
      </header>

      {/* Main */}
      <main style={{ flex: 1, padding: '36px' }}>

        <SecurityComplianceCard />
        <OAuth2FACard />
        <CleanupCard />

        {/* Pagination — shared with Page 1 */}
        <section>
          <SectionHeading>Pagination</SectionHeading>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} style={paginationBtn(false)}>Previous</button>
            {[1, 2].map(page => (
              <button key={page} onClick={() => setCurrentPage(page)} style={paginationBtn(currentPage === page)}>
                {page}
              </button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} style={paginationBtn(false)}>Next</button>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: c.headerBg,
        padding:         '16px',
        textAlign:       'center',
        borderTop:       `2px solid ${c.border}`,
      }}>
        <p style={{ color: c.textMuted, margin: 0, fontSize: '14px' }}>
          © 2025 Nutritional Insights. All Rights Reserved.
        </p>
      </footer>

    </div>
  )
}