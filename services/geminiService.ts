import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { CaseData } from "../types";

// Helper to safely access API key from environment variables
// Vite only exposes variables prefixed with VITE_ to the client
const getApiKey = (): string => {
  // Try Vite's import.meta.env first (VITE_ prefix required for client access)
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // Vite only exposes VITE_ prefixed vars to client
      const viteKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (viteKey && viteKey.trim() !== '') {
        return viteKey;
      }
    }
  } catch (e) {
    console.warn("Unable to access import.meta.env:", e);
  }
  
  // Fallback to process.env (for server-side or build-time)
  try {
    if (typeof process !== 'undefined' && process.env) {
      const procKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.API_KEY;
      if (procKey && procKey.trim() !== '') {
        return procKey;
      }
    }
  } catch (e) {
    console.warn("Unable to access process.env:", e);
  }
  
  console.warn("Gemini API key not found. Please set VITE_GEMINI_API_KEY in your .env file");
  return '';
};

// Create AI instance dynamically to get fresh API key each time
const getAI = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is missing. Please set VITE_GEMINI_API_KEY in your .env file');
  }
  return new GoogleGenAI({ apiKey });
};

const SYSTEM_INSTRUCTION = `
You are ForensiAI, an advanced digital forensic assistant. 
Your goal is to assist investigators in analyzing UFDR (Universal Forensic Extraction) data.
You must adhere to the following rules:
1. USE SAFE TERMINOLOGY: Do not use words like "threat", "risk", or "danger". Instead, use "anomaly", "inconsistency", "unusual pattern", or "outlier".
2. BE PRECISE: Base your answers strictly on the provided JSON context. Do not hallucinate.
3. BE PROFESSIONAL: Tone should be objective and suitable for a legal report.
4. FORMAT: Use Markdown for all responses.
`;

export const analyzeCase = async (caseData: CaseData, query: string): Promise<string> => {
  const key = getApiKey();
  if (!key) {
    return "Error: Gemini API Key is missing. Please set VITE_GEMINI_API_KEY in your .env file and restart the server.";
  }

  const context = JSON.stringify(caseData);
  const prompt = `
  CONTEXT (UFDR DATA):
  ${context}

  USER QUERY:
  ${query}

  Please analyze the data and answer the query.
  `;

  try {
    const ai = getAI();
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2, // Low temperature for factual analysis
      }
    });
    return response.text || "No analysis generated.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Provide more helpful error messages
    if (error?.error?.message?.includes('API key not valid')) {
      return "Error: Invalid Gemini API key. Please check your VITE_GEMINI_API_KEY in the .env file and make sure it's correct.";
    }
    if (error?.error?.message?.includes('API key')) {
      return `Error: ${error.error.message}. Please check your .env file.`;
    }
    
    return "An error occurred during analysis. Please check the console for details.";
  }
};

export const generateCaseReport = async (caseData: CaseData): Promise<string> => {
  const key = getApiKey();
  if (!key) {
    return "Error: Gemini API Key is missing. Please set VITE_GEMINI_API_KEY in your .env file and restart the server.";
  }

  const context = JSON.stringify(caseData);
  const prompt = `
  CONTEXT (UFDR DATA):
  ${context}

  TASK:
  Generate a comprehensive investigator-ready case summary report.
  Include:
  1. Executive Summary
  2. Key Entities (Persons of Interest)
  3. Timeline of Significant Events
  4. Communication Analysis (Who talks to whom?)
  5. Potential Anomalies or Inconsistencies (e.g., gaps in time, foreign numbers)
  
  Format as clean Markdown.
  `;

  try {
    const ai = getAI();
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // or gemini-3-pro-preview for deeper reasoning
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3,
      }
    });
    return response.text || "Report generation failed.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    if (error?.error?.message?.includes('API key not valid')) {
      return "Error: Invalid Gemini API key. Please check your VITE_GEMINI_API_KEY in the .env file.";
    }
    
    return "Failed to generate report due to API error. Please check the console.";
  }
};