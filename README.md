
# ZENITH ELITE: AI-Powered Smart Resume Analyzer

## Project Overview
ZENITH ELITE is a high-fidelity Career Quantification Engine designed for university-level final year project evaluation. It leverages Natural Language Processing (NLP) and Large Language Models (LLMs) to perform deep semantic analysis on professional resumes.

### Key Features
- **Intelligent Document Parsing**: Supports PDF and DOCX uploads with multi-modal vision fallback for image-based resumes.
- **Deep Semantic Matching**: Uses Gemini 3 Pro to calculate semantic similarity, keyword density, and structural integrity.
- **Explainable ATS Scoring**: Transparent breakdown of scores including Readability, Impact, and Formatting.
- **Strategic Roadmapping**: Generates a 3-phase actionable roadmap for career advancement.
- **AI Career Consultant**: Integrated chat for real-time professional guidance.

## Academic Significance
This project demonstrates the application of:
1. **Semantic Search & Embeddings**: Calculating similarity between resume vectors and job description requirements.
2. **Heuristic Scoring Models**: Implementing a transparent weighted algorithm for Applicant Tracking System (ATS) simulation.
3. **Advanced Prompt Engineering**: Structured JSON extraction and thinking-budgeted reasoning for complex feedback.
4. **Modern UI/UX Design**: Highly responsive, accessible, and aesthetically driven frontend architecture.

## Tech Stack
- **Frontend**: React 19 + Tailwind CSS + Framer-inspired animations.
- **Core Engine**: Gemini 3 Pro (Analysis) & Gemini 2.5 Flash (Vision).
- **Styling**: Emerald and Orange high-contrast palette.
- **Logic**: ES6+ Functional Programming with strict Type definitions.

## Project Structure
- `App.tsx`: Central control unit and UI layout.
- `services/geminiService.ts`: Core AI integration and prompt engineering logic.
- `types.ts`: Interface definitions for strict data handling.
- `components/`: Modular UI elements (ScoreCards, Preview, Uploaders).

## Setup & Execution
1. Ensure `process.env.API_KEY` is configured in your execution environment.
2. Open `index.html` in a modern browser.
3. Upload a Resume (PDF/DOCX) and optionally paste a Job Description.
4. Click **Analyze Profile** to generate a comprehensive report.

---
*Created for University Final Year Project Evaluation - Focus on Explainability and Innovation.*
