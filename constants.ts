
/**
 * ACADEMIC SCORING FORMULA EXPLANATION
 * 
 * Final Score (S) = (W1 * K) + (W2 * Sim) + (W3 * Edu) + (W4 * Exp)
 * 
 * K: Keyword Match Score (Direct overlap of tokenized terms)
 * Sim: Semantic Similarity (Embedding-based contextual match)
 * Edu: Education Relevance (Degree and field matching)
 * Exp: Experience Duration/Seniority Match
 */

export const SCORING_WEIGHTS = {
  KEYWORD: 0.35,      // Frequency of hard skills
  SEMANTIC: 0.40,     // Contextual relevance using Embeddings/LLM
  EDUCATION: 0.10,    // Degree requirements
  EXPERIENCE: 0.15    // Quantifiable years/seniority
};

export const MOCK_JOB_DESCRIPTIONS = [
  {
    title: "Software Engineer",
    content: "We are looking for a Software Engineer proficient in React, Node.js, and TypeScript. Experience with REST APIs, SQL databases, and cloud platforms like AWS is preferred. Strong problem-solving skills and 3+ years of experience are required."
  },
  {
    title: "Data Scientist",
    content: "Seeking a Data Scientist with expertise in Python, R, and Machine Learning frameworks (Scikit-learn, TensorFlow). Experience in data visualization using Tableau or PowerBI. Masters in CS or Math preferred. Ability to communicate insights clearly."
  }
];
