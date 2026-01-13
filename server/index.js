import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import net from 'net'
import geoip from 'geoip-lite'
import { fileURLToPath } from 'url'
import generateRouter from './routes/generate.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ALLOWLIST_PATH = path.resolve(__dirname, '..', 'allowed_states.txt')
let allowedStatesCache = new Set()
let allowedStatesMtimeMs = 0

function loadAllowedStates() {
  try {
    const raw = fs.readFileSync(ALLOWLIST_PATH, 'utf8')
    return new Set(
      raw
        .split(/\r?\n/)
        .map(line => line.trim().toUpperCase())
        .filter(line => line && !line.startsWith('#'))
    )
  } catch (error) {
    console.error('Failed to load allowed states list:', error.message)
    return new Set()
  }
}

function getAllowedStates() {
  try {
    const stat = fs.statSync(ALLOWLIST_PATH)
    if (stat.mtimeMs !== allowedStatesMtimeMs) {
      allowedStatesMtimeMs = stat.mtimeMs
      allowedStatesCache = loadAllowedStates()
    }
  } catch (error) {
    if (allowedStatesCache.size === 0) {
      console.error('Failed to stat allowed states list:', error.message)
    }
  }

  return allowedStatesCache
}

function formatAllowedStatesMessage(allowedStates) {
  if (!allowedStates || allowedStates.size === 0) {
    return 'Access denied'
  }

  const list = Array.from(allowedStates).sort().join(', ')
  return `Access blocked by location restrictions. This service is only available in ${list}.`
}

function normalizeIp(value) {
  if (!value) {
    return ''
  }

  let ip = value
  if (Array.isArray(ip)) {
    ip = ip[0]
  }
  if (typeof ip !== 'string') {
    return ''
  }

  if (ip.includes(',')) {
    ip = ip.split(',')[0].trim()
  }

  ip = ip.trim()
  if (ip.startsWith('::ffff:')) {
    ip = ip.slice(7)
  }

  return ip
}

function isPrivateIp(ip) {
  if (!ip) {
    return false
  }

  if (ip === '::1' || ip === '127.0.0.1') {
    return true
  }

  if (net.isIP(ip) === 6) {
    return ip.startsWith('fc') || ip.startsWith('fd') || ip.startsWith('fe80:')
  }

  if (net.isIP(ip) !== 4) {
    return false
  }

  if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('169.254.')) {
    return true
  }

  if (ip.startsWith('172.')) {
    const second = Number(ip.split('.')[1])
    return second >= 16 && second <= 31
  }

  return false
}

// Middleware
app.set('trust proxy', true)
app.use(cors())
app.use(express.json({ limit: '50mb' }))

app.use((req, res, next) => {
  const ip = normalizeIp(req.ip || req.headers['x-forwarded-for'])
  const allowedStates = getAllowedStates()
  const blockedMessage = formatAllowedStatesMessage(allowedStates)

  if (!ip) {
    return res.status(403).json({ message: blockedMessage })
  }

  if (isPrivateIp(ip)) {
    return next()
  }

  const geo = geoip.lookup(ip)
  if (!geo || geo.country !== 'US' || !geo.region) {
    return res.status(403).json({ message: blockedMessage })
  }

  if (!allowedStates.has(geo.region.toUpperCase())) {
    return res.status(403).json({ message: blockedMessage })
  }

  return next()
})

// Routes
app.use('/api', generateRouter)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).json({
    message: err.message || 'Internal server error'
  })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
