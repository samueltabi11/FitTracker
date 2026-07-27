export const TOKEN_KEY = 'fittracker_token'
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
  localStorage.setItem(GUEST_KEY, 'true')
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(GUEST_KEY)
}
