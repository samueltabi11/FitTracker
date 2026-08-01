export const API_BASE_URL = 'https://fittracker-4cqg.onrender.com'

export const TOKEN_KEY = 'fittracker_token'
export const REFRESH_TOKEN_KEY = 'fittracker_refresh_token'
export const GUEST_KEY = 'fittracker_guest'

export function isAuthenticated() {
  return Boolean(localStorage.getItem(TOKEN_KEY))
}

export function isGuest() {
  return localStorage.getItem(GUEST_KEY) === 'true'
}

export function hasAccess() {
  return isAuthenticated() || isGuest()
}

export function continueAsGuest() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.setItem(GUEST_KEY, 'true')
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(GUEST_KEY)
}

// Exchanges the stored refresh token for a new access token. Returns the new
// access token on success, or null if the refresh token is missing/expired.
export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
  if (!refreshToken) {
    return null
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken })
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    localStorage.setItem(TOKEN_KEY, data.access)
    return data.access
  } catch {
    return null
  }
}

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}` }
}

// Wraps fetch with the access token, and on a 401 tries refreshing it once
// before retrying. If the refresh token is also invalid, logs the user out
// and redirects to /login.
export async function authFetch(url, options = {}) {
  const doFetch = () =>
    fetch(url, { ...options, headers: { ...options.headers, ...authHeaders() } })

  let response = await doFetch()

  if (response.status === 401) {
    const newToken = await refreshAccessToken()

    if (!newToken) {
      logout()
      window.location.href = '/login'
      return response
    }

    response = await doFetch()
  }

  return response
}
