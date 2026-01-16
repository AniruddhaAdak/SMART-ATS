
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
      Act as an elite career mentor. Your goal is to analyze a resume with precision and provide simple, actionable feedback.
      
      ${isGeneral 
        ? "Evaluate this resume's overall strength for high-tier professional roles." 
        : "Compare this resume against the following job description and find the gaps."}
      
      ${!isGeneral ? `TARGET JOB:\n${jdText}` : "CONTEXT: Modern High-Impact Careers"}
      
      RESUME DATA:
      ${resumeText}

      OUTPUT SPECIFICATIONS:
      Return a JSON object. Scores must be between 0 and 100.
      Required fields:
      - scores: { keywordMatch, semanticSimilarity, educationRelevance, experienceScore, readabilityScore, impactScore, formattingScore, finalAtsScore }
      - details: { matchedKeywords, missingKeywords, skillsAnalysis, strengths, weaknesses, improvementSuggestions, contentAudit, rolePotential }
      - explanation: A simple, punchy, one-sentence summary of the overall verdict. Avoid jargon.
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
          thinkingConfig: { thinkingBudget: 2000 } 
        },
      });

      const cleanJson = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      // Ensure explanation is always a string to avoid split() errors in UI
      if (typeof parsed.explanation !== 'string') {
        parsed.explanation = "Your profile shows strong potential with specific areas for optimization.";
      }
      
      return parsed;
    } catch (error) {
      console.error("Deep Analysis Error:", error);
      throw new Error("The AI engine is busy. Please try again in a moment.");
    }
  }

  async editImage(base64Image: string, mimeType: string, prompt: string): Promise<string> {
    const aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const model = 'gemini-2.5-flash-image';
    try {
      const response = await aiInstance.models.generateContent({
        model,
        contents: {
          parts: [
            { inlineData: { data: base64Image, mimeType } },
            { text: prompt }
          ]
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
      throw new Error("Visual processing failed.");
    } catch (error) {
      console.error("Image Error:", error);
      throw error;
    }
  }

  createChatSession(): Chat {
    return this.ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: "You are ZENITH, a world-class career strategist. Speak simply. Be bold but friendly. Help the user win. Use only Emerald and Orange colors in your personality. Never mention blue or violet."
      }
    });
  }
}
