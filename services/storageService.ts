import { CaseData } from '../types';

const STORAGE_KEY = 'forensiai_cases_v1';

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
