
// @google/genai guidelines followed: use GoogleGenAI, Type, and direct apiKey access.
import { GoogleGenAI, Chat, Type, GenerateContentResponse } from "@google/genai";
import { AnalysisResult } from "../types";

export class GeminiService {
  // Guidelines: Create a new GoogleGenAI instance right before making an API call 
  // to ensure it always uses the most up-to-date API key.

  async analyzeResume(resumeText: string, jdText?: string, resumeFile?: { data: string, mimeType: string }): Promise<AnalysisResult> {
    // Guidelines: Always use new GoogleGenAI({ apiKey: process.env.API_KEY }) directly.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-pro-preview';
    const isGeneral = !jdText || jdText.trim().length === 0;

    // Guidelines: Use responseSchema for structured JSON output.
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
      Act as an elite career strategist. Conduct a high-fidelity audit of this resume.
      
      ${isGeneral 
        ? "Analyze the overall marketability and executive presence of this resume." 
        : "Perform a high-precision gap analysis against the target job description requirements."}
      
      ${!isGeneral ? `TARGET JOB PARAMETERS:\n${jdText}` : "CONTEXT: Modern High-Growth Global Industry"}
      
      USER RESUME DATA:
      ${resumeText}

      STRICT OUTPUT SPECIFICATIONS:
      Return a VALID JSON object. Ensure all numeric scores are between 0 and 100.
    `;

    try {
      const parts: any[] = [{ text: prompt }];
      if (resumeFile) {
        parts.push({ inlineData: { data: resumeFile.data, mimeType: resumeFile.mimeType } });
      }

      // Guidelines: Use ai.models.generateContent and response.text property.
      const response: GenerateContentResponse = await ai.models.generateContent({
        model,
        contents: { parts },
        config: { 
          responseMimeType: "application/json",
          responseSchema,
          thinkingConfig: { thinkingBudget: 32768 } // Max budget for gemini-3-pro-preview
        },
      });

      const text = response.text;
      if (!text) throw new Error("Empty response from AI");
      
      return JSON.parse(text);
    } catch (error) {
      console.error("Deep Analysis Error:", error);
      throw new Error("Industrial Career Engine encountered a synchronization fault. Please re-initiate audit.");
    }
  }

  createChatSession(context?: AnalysisResult): Chat {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const contextStr = context ? `CURRENT USER AUDIT CONTEXT: ${JSON.stringify(context)}. Use this data to answer accurately.` : "User has not analyzed a resume yet.";
    
    // Guidelines: Use ai.chats.create for conversational interaction.
    return ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: `You are ZENITH, an elite AI career strategist. 
        ${contextStr}
        IDENTITY RULES:
        1. NEVER use markdown symbols like #, ##, ###, **, or __.
        2. Keep responses short, precise, and friendly. 
        3. Use simple line breaks for formatting.
        4. Focus on high-impact actionable advice based on the user's specific audit scores and roadmap.
        5. Use simple text for emphasis if needed. No bolding or italics markdown.`
      }
    });
  }
}
