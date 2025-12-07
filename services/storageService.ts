import { CaseData, Officer, ViewState } from '../types';

const STORAGE_KEY = 'forensiai_cases_v1';
const AUTH_STORAGE_KEY = 'forensiai_auth_v1';
const SESSION_STORAGE_KEY = 'forensiai_session_v1';

export const getSavedCases = (): CaseData[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load cases", e);
    return [];
  }
};

export const saveCase = (newCase: CaseData): void => {
  const cases = getSavedCases();
  const existingIndex = cases.findIndex(c => c.id === newCase.id);
  
  if (existingIndex >= 0) {
    cases[existingIndex] = newCase;
  } else {
    // Add to beginning of list
    cases.unshift(newCase);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
};

export const deleteCase = (id: string): void => {
  const cases = getSavedCases().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
};

export const getCase = (id: string): CaseData | undefined => {
  const cases = getSavedCases();
  return cases.find(c => c.id === id);
};

// --- Authentication Persistence ---
export interface AuthState {
  isAuthenticated: boolean;
  username: string;
  currentUser: Officer | null;
  isDemoMode?: boolean;
}

export interface SessionState {
  view: ViewState;
  caseId: string | null;
}

export const saveAuthState = (authState: AuthState): void => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
  } catch (e) {
    console.error("Failed to save auth state", e);
  }
};

export const getAuthState = (): AuthState | null => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Failed to load auth state", e);
    return null;
  }
};

export const clearAuthState = (): void => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear auth state", e);
  }
};

export const saveSessionState = (sessionState: SessionState): void => {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionState));
  } catch (e) {
    console.error("Failed to save session state", e);
  }
};

export const getSessionState = (): SessionState | null => {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Failed to load session state", e);
    return null;
  }
};

export const clearSessionState = (): void => {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear session state", e);
  }
};
