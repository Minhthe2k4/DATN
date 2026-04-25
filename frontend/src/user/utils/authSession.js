const USER_SESSION_KEY = 'user-session'

export function getUserSession() {
  try {
    const raw = window.localStorage.getItem(USER_SESSION_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function setUserSession(session) {
  if (!session || typeof session !== 'object') {
    return
  }

  window.localStorage.setItem(USER_SESSION_KEY, JSON.stringify(session))
}

export function clearUserSession() {
  window.localStorage.removeItem(USER_SESSION_KEY)
}

export function getAuthHeader() {
    const session = getUserSession();
    if (session && session.userId) {
        return { Authorization: `Bearer ${session.userId}` };
    }
    return {};
}
