
export const SCORING_WEIGHTS = {
  KEYWORD: 0.35,
  SEMANTIC: 0.40,
  EDUCATION: 0.10,
  EXPERIENCE: 0.15
};

export const SCORE_EXPLANATIONS = {
  keywordMatch: "How well your words match the job requirements.",
  semanticSimilarity: "How well your overall profile fits the role's meaning.",
  educationRelevance: "Checks if your schooling matches the job level.",
  experienceScore: "Looks at your years of work and job titles.",
  readabilityScore: "How easy it is for a person or machine to read your resume.",
  impactScore: "Checks for numbers and results that show your success.",
  formattingScore: "Ensures your layout is clean and consistent.",
  finalAtsScore: "A total score based on keywords, meaning, school, and work history."
};

export const MOCK_JOB_DESCRIPTIONS = [
  {
    title: "Executive Director",
    content: "We need a leader with 10+ years experience. Focus on strategy, growth, and team building."
  },
  {
    title: "Software Engineer",
    content: "Seeking a builder who knows Python and React. Focus on clean code and solving hard problems."
  }
];
