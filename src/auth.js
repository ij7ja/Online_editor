const tokenKey = "codeEditorAuthToken";
const userKey = "codeEditorAuthUser";

export function getAuthToken() {
  return localStorage.getItem(tokenKey) || sessionStorage.getItem(tokenKey);
}

export function saveAuth({ remember, token, user }) {
  const selectedStorage = remember ? localStorage : sessionStorage;
  const otherStorage = remember ? sessionStorage : localStorage;

  otherStorage.removeItem(tokenKey);
  otherStorage.removeItem(userKey);
  selectedStorage.setItem(tokenKey, token);
  selectedStorage.setItem(userKey, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(userKey);
  sessionStorage.removeItem(tokenKey);
  sessionStorage.removeItem(userKey);
}
