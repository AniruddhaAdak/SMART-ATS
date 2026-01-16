
// @google/genai guidelines followed: use GoogleGenAI, Type, and direct apiKey access.
import { GoogleGenAI, Chat, Type, GenerateContentResponse } from "@google/genai";
import { AnalysisResult } from "../types";

export class GeminiService {

  async analyzeResume(resumeText: string, jdText?: string, resumeFile?: { data: string, mimeType: string }): Promise<AnalysisResult> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-pro-preview';
    const isGeneral = !jdText || jdText.trim().length === 0;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        scores: {
          type: Type.OBJECT,
          properties: {
            keywordMatch: { type: Type.NUMBER },
            semanticSimilarity: { type: Type.NUMBER },
            educationRelevance: { type: Type.NUMBER },
            experienceScore: { type: Type.NUMBER },
            readabilityScore: { type: Type.NUMBER },
            impactScore: { type: Type.NUMBER },
            formattingScore: { type: Type.NUMBER },
            finalAtsScore: { type: Type.NUMBER },
          },
          required: ["keywordMatch", "semanticSimilarity", "educationRelevance", "experienceScore", "readabilityScore", "impactScore", "formattingScore", "finalAtsScore"],
        },
        details: {
          type: Type.OBJECT,
          properties: {
            matchedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvementSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            immediateWins: { type: Type.ARRAY, items: { type: Type.STRING } },
            longTermStrategy: { type: Type.ARRAY, items: { type: Type.STRING } },
            roadmap: {
              type: Type.OBJECT,
              properties: {
                phase1: { type: Type.STRING },
                phase2: { type: Type.STRING },
                phase3: { type: Type.STRING },
              },
              required: ["phase1", "phase2", "phase3"],
            },
            rolePotential: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["matchedKeywords", "missingKeywords", "strengths", "weaknesses", "improvementSuggestions", "immediateWins", "longTermStrategy", "roadmap", "rolePotential"],
        },
        explanation: { type: Type.STRING },
      },
      required: ["scores", "details", "explanation"],
    };

    const prompt = `
      Act as a friendly career coach. Review this resume using simple language.
      
      ${isGeneral 
        ? "Give a simple review of how good this resume is for job hunting." 
        : "Explain clearly how well this resume fits this specific job."}
      
      ${!isGeneral ? `JOB DESCRIPTION:\n${jdText}` : ""}
      
      RESUME TEXT:
      ${resumeText}

      INSTRUCTIONS:
      1. Use simple, everyday words. Avoid jargon.
      2. Be encouraging but honest.
      3. Return a valid JSON object.
    `;

    try {
      const parts: any[] = [{ text: prompt }];
      if (resumeFile) {
        parts.push({ inlineData: { data: resumeFile.data, mimeType: resumeFile.mimeType } });
      }

      const response: GenerateContentResponse = await ai.models.generateContent({
        model,
        contents: { parts },
        config: { 
          responseMimeType: "application/json",
          responseSchema,
          thinkingConfig: { thinkingBudget: 1000 }
        },
      });

      const text = response.text;
      if (!text) throw new Error("No response");
      
      return JSON.parse(text);
    } catch (error) {
      console.error("Analysis Error:", error);
      throw new Error("Could not analyze your resume. Please try again.");
    }
  }

  createChatSession(context?: AnalysisResult): Chat {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const contextStr = context ? `I analyzed their resume: ${JSON.stringify(context)}` : "No resume analyzed yet.";
    
    return ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: `You are a friendly and simple career coach named Zenith. 
        ${contextStr}
        RULES:
        1. Use VERY simple English. No big words.
        2. NO markdown (no #, *, **).
        3. Keep answers short (1-3 sentences).
        4. Be helpful and kind.`
      }
    });
  }
}
