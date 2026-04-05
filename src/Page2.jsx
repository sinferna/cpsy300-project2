import { useState, useEffect } from 'react'
import { auth, googleProvider, githubProvider } from './config/firebase'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'

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

// ────────────────────────────────────────────────────────────────────────────
//  SecurityComplianceCard — runs real backend security scans
// ────────────────────────────────────────────────────────────────────────────
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
      setSecurityStatus(null)
    } finally {
      setLoading(false)
    }
  }

  const CheckItem = ({ check }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', margin: '0 0 6px', fontSize: '13px' }}>
      <span style={{ color: check.passed ? c.successText : c.errorText, fontWeight: '700', flexShrink: 0 }}>
        {check.passed ? '\u2713' : '\u2717'}
      </span>
      <span>
        <span style={{ color: c.textPrimary, fontWeight: '600' }}>{check.check}</span>
        <span style={{ color: c.textMuted }}> — {check.detail}</span>
      </span>
    </div>
  )

  const CategoryBlock = ({ title, category }) => (
    <div style={{ marginBottom: '16px' }}>
      <p style={{ margin: '0 0 8px', fontWeight: '700', fontSize: '14px', color: category.passed ? c.successText : c.errorText }}>
        {title}: {category.label}
      </p>
      {category.checks.map((ch, i) => <CheckItem key={i} check={ch} />)}
    </div>
  )

  return (
    <section style={{ marginBottom: '36px' }}>
      <SectionHeading>Security &amp; Compliance</SectionHeading>
      <Card>
        <Btn onClick={fetchSecurityStatus} color={c.btnBlue} disabled={loading}>
          {loading ? 'Scanning\u2026' : 'Run Security Scan'}
        </Btn>

        {securityStatus && (
          <div style={{ marginTop: '18px' }}>
            <div style={{
              display: 'inline-block',
              padding: '6px 14px',
              borderRadius: '6px',
              marginBottom: '16px',
              backgroundColor: securityStatus.allPassed ? '#14532d' : '#7f1d1d',
              color: securityStatus.allPassed ? c.successText : c.errorText,
              fontSize: '13px',
              fontWeight: '600',
            }}>
              {securityStatus.allPassed ? 'All checks passed' : 'Some checks need attention'}
            </div>

            <CategoryBlock title="Encryption" category={securityStatus.encryption} />
            <CategoryBlock title="Access Control" category={securityStatus.accessControl} />
            <CategoryBlock title="Compliance" category={securityStatus.compliance} />

            <p style={{ margin: '8px 0 0', fontSize: '12px', color: c.textMuted }}>
              Scanned at {new Date(securityStatus.timestamp).toLocaleString()}
            </p>
          </div>
        )}
      </Card>
    </section>
  )
}

// ────────────────────────────────────────────────────────────────────────────
//  OAuth2FACard — Firebase OAuth + real TOTP 2FA
// ────────────────────────────────────────────────────────────────────────────
function OAuth2FACard() {
  const [user, setUser]                 = useState(null)
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [authMessage, setAuthMessage]   = useState('')
  const [authType, setAuthType]         = useState('info')
  const [loading, setLoading]           = useState(false)
  const [qrCode, setQrCode]            = useState(null)
  const [manualKey, setManualKey]       = useState('')
  const [twoFASetup, setTwoFASetup]    = useState(false)
  const [twoFAVerified, setTwoFAVerified] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        check2FAStatus(currentUser.email)
      } else {
        setQrCode(null)
        setManualKey('')
        setTwoFASetup(false)
        setTwoFAVerified(false)
      }
    })
    return unsubscribe
  }, [])

  const check2FAStatus = async (email) => {
    try {
      const res = await fetch(`/api/verify-2fa/status?email=${encodeURIComponent(email)}`)
      const data = await res.json()
      setTwoFASetup(data.setup)
      setTwoFAVerified(data.verified)
    } catch {
      setTwoFASetup(false)
      setTwoFAVerified(false)
    }
  }

  const handleOAuth = async (provider) => {
    setLoading(true)
    setAuthMessage('')
    try {
      const providerObj = provider === 'Google' ? googleProvider : githubProvider
      const result = await signInWithPopup(auth, providerObj)
      setAuthMessage(`Signed in as ${result.user.displayName || result.user.email}`)
      setAuthType('success')
    } catch (err) {
      setAuthMessage(err.message || `${provider} login failed.`)
      setAuthType('error')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut(auth)
    setUser(null)
    setQrCode(null)
    setManualKey('')
    setTwoFASetup(false)
    setTwoFAVerified(false)
    setAuthMessage('Signed out successfully.')
    setAuthType('info')
  }

  const setup2FA = async () => {
    if (!user) return
    setLoading(true)
    setAuthMessage('')
    try {
      const res = await fetch('/api/verify-2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      })
      const data = await res.json()
      setQrCode(data.qrCode)
      setManualKey(data.manualKey)
      setTwoFASetup(true)
      setTwoFAVerified(false)
      setAuthMessage(data.message)
      setAuthType('info')
    } catch {
      setAuthMessage('Failed to set up 2FA.')
      setAuthType('error')
    } finally {
      setLoading(false)
    }
  }

  const verify2FA = async () => {
    if (!twoFactorCode.trim()) {
      setAuthMessage('Please enter your 2FA code.')
      setAuthType('error')
      return
    }
    if (!user) {
      setAuthMessage('Please sign in first.')
      setAuthType('error')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: twoFactorCode, email: user.email }),
      })
      const data = await res.json()
      setAuthMessage(data.message)
      setAuthType(res.ok ? 'success' : 'error')
      if (res.ok) {
        setTwoFAVerified(true)
        setQrCode(null)
      }
    } catch {
      setAuthMessage('Failed to verify 2FA code.')
      setAuthType('error')
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

        {user ? (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              {user.photoURL && (
                <img src={user.photoURL} alt="avatar" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
              )}
              <div>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: c.textPrimary }}>
                  {user.displayName || 'User'}
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: c.textMuted }}>{user.email}</p>
              </div>
              {twoFAVerified && (
                <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#14532d', color: c.successText, fontWeight: '600' }}>
                  2FA Active
                </span>
              )}
            </div>
            <Btn onClick={handleLogout} color={c.btnRed}>Sign Out</Btn>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <Btn onClick={() => handleOAuth('Google')} color={c.btnBlue} disabled={loading}>
              {loading ? 'Signing in\u2026' : 'Login with Google'}
            </Btn>
            <Btn onClick={() => handleOAuth('GitHub')} color={c.btnBlue} disabled={loading}>
              {loading ? 'Signing in\u2026' : 'Login with GitHub'}
            </Btn>
          </div>
        )}

        {/* 2FA Section — only show when logged in */}
        {user && (
          <div style={{ borderTop: `1px solid ${c.border}`, paddingTop: '18px', marginTop: '8px' }}>
            <p style={{ margin: '0 0 12px', fontWeight: '700', fontSize: '15px', color: c.textAccent }}>
              Two-Factor Authentication (TOTP)
            </p>

            {!twoFASetup && !twoFAVerified && (
              <div style={{ marginBottom: '14px' }}>
                <p style={{ margin: '0 0 10px', fontSize: '13px', color: c.textMuted }}>
                  Secure your account with an authenticator app (Google Authenticator, Authy, etc.)
                </p>
                <Btn onClick={setup2FA} color={c.btnGreen} disabled={loading}>
                  {loading ? 'Setting up\u2026' : 'Set Up 2FA'}
                </Btn>
              </div>
            )}

            {qrCode && !twoFAVerified && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ margin: '0 0 8px', fontSize: '13px', color: c.textMuted }}>
                  Scan this QR code with your authenticator app:
                </p>
                <img src={qrCode} alt="2FA QR Code" style={{ width: '200px', height: '200px', borderRadius: '8px', marginBottom: '8px' }} />
                <p style={{ margin: '0 0 12px', fontSize: '12px', color: c.textMuted }}>
                  Or enter this key manually: <code style={{ color: c.textPrimary, backgroundColor: '#0f1f1a', padding: '2px 6px', borderRadius: '4px' }}>{manualKey}</code>
                </p>
              </div>
            )}

            {twoFASetup && !twoFAVerified && (
              <div>
                <label style={{ display: 'block', fontSize: '14px', color: c.textMuted, marginBottom: '8px' }}>
                  Enter the 6-digit code from your authenticator app
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="tel"
                    placeholder="000000"
                    value={twoFactorCode}
                    onChange={e => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    style={{
                      padding:         '10px 14px',
                      borderRadius:    '8px',
                      border:          `1px solid ${c.border}`,
                      fontSize:        '18px',
                      letterSpacing:   '4px',
                      backgroundColor: '#0f1f1a',
                      color:           c.textPrimary,
                      outline:         'none',
                      width:           '160px',
                      textAlign:       'center',
                    }}
                  />
                  <Btn onClick={verify2FA} color={c.btnGreen} disabled={loading}>
                    {loading ? 'Verifying\u2026' : 'Verify'}
                  </Btn>
                </div>
              </div>
            )}

            {twoFAVerified && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: c.successText, fontSize: '18px' }}>{'\u2713'}</span>
                <p style={{ margin: 0, fontSize: '14px', color: c.successText, fontWeight: '600' }}>
                  Two-factor authentication is active and verified.
                </p>
              </div>
            )}
          </div>
        )}

        <Message msg={authMessage} type={authType} />
      </Card>
    </section>
  )
}

// ────────────────────────────────────────────────────────────────────────────
//  CleanupCard — real file system cleanup
// ────────────────────────────────────────────────────────────────────────────
function CleanupCard() {
  const [cleanupResult, setCleanupResult] = useState(null)
  const [loading, setLoading]            = useState(false)

  const handleCleanup = async () => {
    setLoading(true)
    setCleanupResult(null)
    try {
      const res  = await fetch('/api/cleanup', { method: 'POST' })
      const data = await res.json()
      setCleanupResult(data)
    } catch {
      setCleanupResult({ message: 'Failed to reach cleanup endpoint.', removed: [], warnings: [] })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section style={{ marginBottom: '36px' }}>
      <SectionHeading>Cloud Resource Cleanup</SectionHeading>
      <Card>
        <p style={{ margin: '0 0 16px', fontSize: '14px', color: c.textMuted }}>
          Scan for and clean up stale temporary files, empty directories, and unused resources.
        </p>
        <Btn onClick={handleCleanup} color={c.btnRed} disabled={loading}>
          {loading ? 'Scanning\u2026' : 'Run Cleanup'}
        </Btn>

        {cleanupResult && (
          <div style={{ marginTop: '14px' }}>
            <Message msg={cleanupResult.message} type={cleanupResult.removed?.length > 0 ? 'success' : 'info'} />

            {cleanupResult.removed?.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '600', color: c.textAccent }}>Removed:</p>
                {cleanupResult.removed.map((r, i) => (
                  <p key={i} style={{ margin: '0 0 4px', fontSize: '12px', color: c.successText }}>
                    {'\u2713'} {r.resource} ({r.type})
                  </p>
                ))}
              </div>
            )}

            {cleanupResult.warnings?.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '600', color: '#fbbf24' }}>Warnings:</p>
                {cleanupResult.warnings.map((w, i) => (
                  <p key={i} style={{ margin: '0 0 4px', fontSize: '12px', color: '#fbbf24' }}>
                    ! {w.resource} — {w.status}
                  </p>
                ))}
              </div>
            )}

            {cleanupResult.stats && (
              <p style={{ margin: '10px 0 0', fontSize: '12px', color: c.textMuted }}>
                node_modules: {cleanupResult.stats.nodeModulesSizeMB} MB (top-level)
              </p>
            )}
          </div>
        )}
      </Card>
    </section>
  )
}

// ────────────────────────────────────────────────────────────────────────────
//  Page 2
// ────────────────────────────────────────────────────────────────────────────
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
          Nutritional Insights
        </h1>
      </header>

      {/* Main */}
      <main style={{ flex: 1, padding: '36px' }}>

        <SecurityComplianceCard />
        <OAuth2FACard />
        <CleanupCard />

        {/* Pagination */}
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
          &copy; 2025 Nutritional Insights. All Rights Reserved.
        </p>
      </footer>

    </div>
  )
}
