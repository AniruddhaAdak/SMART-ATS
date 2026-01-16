
import { GoogleGenAI, Chat } from "@google/genai";
import { AnalysisResult } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async analyzeResume(resumeText: string, jdText?: string, resumeFile?: { data: string, mimeType: string }): Promise<AnalysisResult> {
    const aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const model = 'gemini-3-pro-preview';
    const isGeneral = !jdText || jdText.trim().length === 0;

    const prompt = `
      Act as an elite career strategist. Conduct a deep-dive audit of this resume.
      
      ${isGeneral 
        ? "Analyze the overall marketability and executive presence of this resume." 
        : "Perform a high-precision gap analysis against the target job description."}
      
      ${!isGeneral ? `TARGET JOB:\n${jdText}` : "CONTEXT: High-Growth Modern Industry"}
      
      RESUME CONTENT:
      ${resumeText}

      OUTPUT SPECIFICATIONS:
      Return a STRICT JSON object with these fields:
      - scores: { keywordMatch, semanticSimilarity, educationRelevance, experienceScore, readabilityScore, impactScore, formattingScore, finalAtsScore }
      - details: { 
          matchedKeywords: string[], 
          missingKeywords: string[], 
          strengths: string[], 
          weaknesses: string[], 
          improvementSuggestions: string[], 
          immediateWins: string[], 
          longTermStrategy: string[], 
          roadmap: { phase1: string, phase2: string, phase3: string }, 
          rolePotential: string[] 
        }
      - explanation: A simple, punchy, one-sentence overall verdict in italics.
    `;

    try {
      const parts: any[] = [{ text: prompt }];
      if (resumeFile) {
        parts.push({ inlineData: { data: resumeFile.data, mimeType: resumeFile.mimeType } });
      }

      const response = await aiInstance.models.generateContent({
        model,
        contents: { parts },
        config: { 
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 2500 } 
        },
      });

      const cleanJson = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error("Deep Analysis Error:", error);
      throw new Error("Analysis engine encountered a processing error. Please retry.");
    }
  }

  createChatSession(context?: AnalysisResult): Chat {
    const contextStr = context ? `HERE IS THE USER'S ANALYSIS CONTEXT: ${JSON.stringify(context)}. Use this to answer their questions about their resume.` : "The user hasn't analyzed their resume yet.";
    
    return this.ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: `You are ZENITH, an elite AI career strategist. 
        ${contextStr}
        Use simple, bold, and inspiring language. Always italicize key insights. 
        Focus on actionable, high-impact career advice. Be professional and encouraging.`
      }
    });
  }
}
