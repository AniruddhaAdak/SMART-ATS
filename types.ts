
export interface SkillMatch {
  skill: string;
  found: boolean;
  category: 'technical' | 'soft' | 'domain' | 'tool';
}

export interface AnalysisResult {
  scores: {
    keywordMatch: number;
    semanticSimilarity: number;
    educationRelevance: number;
    experienceScore: number;
    readabilityScore: number;
    impactScore: number;
    formattingScore: number;
    finalAtsScore: number;
  };
  details: {
    matchedKeywords: string[];
    missingKeywords: string[];
    skillsAnalysis: SkillMatch[];
    strengths: string[];
    weaknesses: string[];
    improvementSuggestions: string[];
    contentAudit: {
      bulletPointQuality: string;
      activeVerbUsage: string;
      quantifiableResults: string;
    };
    rolePotential: string[];
  };
  explanation: string;
}

export interface AnalysisState {
  isAnalyzing: boolean;
  result: AnalysisResult | null;
  error: string | null;
}
