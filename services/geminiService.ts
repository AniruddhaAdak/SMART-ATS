
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
      Act as a high-precision career auditor. 
      Analyze this resume text and provide a strict, data-driven report.
      
      ${isGeneral 
        ? "Audit this resume for overall marketability and ATS compatibility." 
        : "Compare this resume against the following JOB DESCRIPTION precisely."}
      
      ${!isGeneral ? `JOB DESCRIPTION:\n${jdText}` : ""}
      
      RESUME DATA:
      ${resumeText}

      INSTRUCTIONS:
      1. Be honest and sharp. Identify exactly where the user is losing points.
      2. Keep the 'explanation' field short (under 50 words) and high-impact.
      3. Use valid JSON only.
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
    const contextStr = context ? `CURRENT AUDIT DATA: ${JSON.stringify(context)}` : "No resume analyzed yet.";
    
    return ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: `You are ZENITH, an elite AI Career Strategist.
        
        ${contextStr}
        
        STRICT RULES TO PREVENT LOOPS & REPETITION:
        1. NEVER repeat the same sentence or phrase twice in one response.
        2. DO NOT list "Role Validation" repeatedly.
        3. BE PRECISE. Use max 3 paragraphs.
        4. Use **BOLD** for keywords and *Italic* for actionable steps.
        5. Mandatory: Start key points with these tags for the UI:
           - [WIN]: Strength or match.
           - [GAP]: Missing skill/weakness.
           - [ACTION]: Immediate task.
           - [STRATEGY]: Long-term career move.
        6. Always cross-reference the CURRENT AUDIT DATA provided. 
        7. If a resume has been uploaded, immediately acknowledge the specific scores (e.g. "Your Impact score is ${context?.scores?.impactScore || 'low'}").
        8. Maintain a professional yet sharp and colorful tone.`
      }
    });
  }
}
