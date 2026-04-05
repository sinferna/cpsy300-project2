const express = require('express');
const { generateSecret, generateURI, verifySync } = require('otplib');
const QRCode = require('qrcode');
const router = express.Router();

// In-memory store of user secrets (keyed by email)
// In production this would be in a database
const userSecrets = new Map();

// POST /api/verify-2fa/setup — Generate a new TOTP secret + QR code for a user
router.post('/setup', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required to set up 2FA.' });
  }

  const secret = generateSecret();
  userSecrets.set(email, { secret, verified: false });

  const otpauth = generateURI({
    secret,
    issuer: 'NutritionalInsights',
    accountName: email,
  });

  try {
    const qrCodeDataUrl = await QRCode.toDataURL(otpauth);
    res.json({
      message: 'Scan the QR code with your authenticator app, then verify with a code.',
      qrCode: qrCodeDataUrl,
      manualKey: secret,
    });
  } catch (err) {
    console.error('QR generation error:', err);
    res.status(500).json({ message: 'Failed to generate QR code.' });
  }
});

// POST /api/verify-2fa — Verify a 6-digit TOTP code
router.post('/', (req, res) => {
  const { code, email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required for verification.' });
  }

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ message: 'Please provide a 2FA code.' });
  }

  const trimmed = code.trim();

  if (!/^\d{6}$/.test(trimmed)) {
    return res.status(400).json({ message: 'Invalid code — must be exactly 6 digits.' });
  }

  const userData = userSecrets.get(email);

  if (!userData) {
    return res.status(400).json({ message: '2FA not set up. Please set up 2FA first.' });
  }

  const result = verifySync({ secret: userData.secret, token: trimmed });

  if (result.valid) {
    userData.verified = true;
    res.json({ message: '2FA verified successfully. Your account is now secured.' });
  } else {
    res.status(401).json({ message: 'Invalid code. Please check your authenticator app and try again.' });
  }
});

// GET /api/verify-2fa/status — Check if a user has 2FA set up and verified
router.get('/status', (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ setup: false, verified: false });
  }

  const userData = userSecrets.get(email);

  if (!userData) {
    return res.json({ setup: false, verified: false });
  }

  res.json({ setup: true, verified: userData.verified });
});

module.exports = router;
