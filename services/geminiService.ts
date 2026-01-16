
import { GoogleGenAI } from "@google/genai";
import { AnalysisResult } from "../types";

export class GeminiAnalyzer {
  constructor() {}

  async analyzeResume(resumeText: string, jdText?: string, resumeFile?: { data: string, mimeType: string }): Promise<AnalysisResult> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const model = 'gemini-3-flash-preview';
    
    const isGeneralAnalysis = !jdText || jdText.trim().length === 0;

    const prompt = `
      Act as a high-tier executive recruiter and ATS algorithm engineer. 
      ${isGeneralAnalysis 
        ? "Perform an ELITE PROFESSIONAL AUDIT of this resume. Evaluate market readiness, readability, and impact." 
        : "Perform a DEEP ARCHITECTURAL MATCH of the Resume against the provided Job Description."}
      
      ${!isGeneralAnalysis ? `TARGET JOB DESCRIPTION:\n${jdText}` : "ANALYSIS CONTEXT: Global Tech & Business Standards"}
      
      CANDIDATE RESUME SOURCE:
      ${resumeText}

      INSTRUCTIONS:
      1. Extract and categorize skills strictly.
      2. Audit content for: Readability, Action Verbs, and Quantifiable Achievements.
      3. Calculate 7 distinct metrics based on industry benchmarks.
      
      Return valid JSON following this exact schema:
      {
        "scores": {
          "keywordMatch": number (0-100),
          "semanticSimilarity": number (0-100),
          "educationRelevance": number (0-100),
          "experienceScore": number (0-100),
          "readabilityScore": number (0-100),
          "impactScore": number (0-100),
          "formattingScore": number (0-100),
          "finalAtsScore": number (0-100)
        },
        "details": {
          "matchedKeywords": string[],
          "missingKeywords": string[],
          "skillsAnalysis": Array<{ "skill": string, "found": boolean, "category": "technical" | "soft" | "domain" | "tool" }>,
          "strengths": string[],
          "weaknesses": string[],
          "improvementSuggestions": string[],
          "contentAudit": {
            "bulletPointQuality": string,
            "activeVerbUsage": string,
            "quantifiableResults": string
          },
          "rolePotential": string[]
        },
        "explanation": string
      }
    `;

    try {
      const parts: any[] = [{ text: prompt }];
      
      if (resumeFile) {
        parts.push({
          inlineData: {
            data: resumeFile.data,
            mimeType: resumeFile.mimeType
          }
        });
      }

      const response = await ai.models.generateContent({
        model,
        contents: { parts },
        config: {
          responseMimeType: "application/json",
          temperature: 0.15,
        },
      });

      const resultText = response.text || '{}';
      const cleanJson = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      const fallback: AnalysisResult = {
        scores: {
          keywordMatch: parsed?.scores?.keywordMatch ?? 0,
          semanticSimilarity: parsed?.scores?.semanticSimilarity ?? 0,
          educationRelevance: parsed?.scores?.educationRelevance ?? 0,
          experienceScore: parsed?.scores?.experienceScore ?? 0,
          readabilityScore: parsed?.scores?.readabilityScore ?? 0,
          impactScore: parsed?.scores?.impactScore ?? 0,
          formattingScore: parsed?.scores?.formattingScore ?? 0,
          finalAtsScore: parsed?.scores?.finalAtsScore ?? 0
        },
        details: {
          matchedKeywords: parsed?.details?.matchedKeywords ?? [],
          missingKeywords: parsed?.details?.missingKeywords ?? [],
          skillsAnalysis: parsed?.details?.skillsAnalysis ?? [],
          strengths: parsed?.details?.strengths ?? [],
          weaknesses: parsed?.details?.weaknesses ?? [],
          improvementSuggestions: parsed?.details?.improvementSuggestions ?? [],
          contentAudit: {
            bulletPointQuality: parsed?.details?.contentAudit?.bulletPointQuality ?? "Analyzing...",
            activeVerbUsage: parsed?.details?.contentAudit?.activeVerbUsage ?? "Analyzing...",
            quantifiableResults: parsed?.details?.contentAudit?.quantifiableResults ?? "Analyzing..."
          },
          rolePotential: parsed?.details?.rolePotential ?? []
        },
        explanation: parsed?.explanation ?? "Analysis complete."
      };

      return fallback;
    } catch (error) {
      console.error("Analysis Error:", error);
      throw new Error("Pipeline interrupted. Please check inputs.");
    }
  }
}
