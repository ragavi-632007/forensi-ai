import { createClient } from '@supabase/supabase-js';

// Access environment variables securely
// Vite uses import.meta.env for environment variables
const getEnvVar = (key: string): string => {
  // Try Vite's import.meta.env first
  try {
    // Check if we're in a Vite environment
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      const value = import.meta.env[key];
      if (value) return value;
    }
  } catch (e) {
    // Fallback if import.meta is not available
  }
  
  // Fallback to process.env (for compatibility)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || '';
  }
  
  return '';
};

// Try multiple environment variable naming conventions
const supabaseUrl = 
  getEnvVar('VITE_SUPABASE_URL') || 
  getEnvVar('REACT_APP_SUPABASE_URL') || 
  getEnvVar('NEXT_PUBLIC_SUPABASE_URL') ||
  '';

const supabaseAnonKey = 
  getEnvVar('VITE_SUPABASE_ANON_KEY') || 
  getEnvVar('REACT_APP_SUPABASE_ANON_KEY') || 
  getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY') ||
  '';

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const isSupabaseConfigured = () => !!supabase;