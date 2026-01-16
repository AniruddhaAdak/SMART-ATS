
export const SCORING_WEIGHTS = {
  KEYWORD: 0.35,
  SEMANTIC: 0.40,
  EDUCATION: 0.10,
  EXPERIENCE: 0.15
};

export const SCORE_EXPLANATIONS = {
  keywordMatch: "How well your skills match the words in the job description.",
  semanticSimilarity: "How well your overall experience fits what the employer wants.",
  educationRelevance: "How well your degrees or certifications match the job.",
  experienceScore: "How well your work history matches the required years and level.",
  readabilityScore: "How easy it is for a computer or a person to read your resume.",
  impactScore: "How well you show results and achievements with numbers.",
  formattingScore: "How professional and clean your resume looks.",
  finalAtsScore: "Your total score. Higher is better for passing automatic filters."
};

export const LOADING_MESSAGES = [
  "Looking at your skills...",
  "Checking the job requirements...",
  "Reading your work history...",
  "Finding ways to improve...",
  "Checking for important keywords...",
  "Comparing your resume to the job...",
  "Looking for missing information...",
  "Analyzing your achievements...",
  "Making a plan for you...",
  "Almost ready..."
];
