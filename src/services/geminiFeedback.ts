import { GoogleGenAI } from "@google/genai";
import { Scenario } from '../constants/scenarios';

interface TranscriptItem {
  id: string;
  text: string;
  isUser?: boolean;
}

export interface FeedbackReport {
  score: number;
  grammar_issues: { original: string; corrected: string; explanation: string }[];
  vocabulary_suggestions: { basic_word: string; advanced_word: string; context: string }[];
  overall_comments: string;
}

export async function generateSessionFeedback(transcript: TranscriptItem[], accent: string, scenario: Scenario): Promise<FeedbackReport | null> {
  const userMessages = transcript.filter(t => t.isUser).map(t => t.text);
  
  if (userMessages.length === 0) {
    return null; // No user input to grade
  }

  const apiKey = (import.meta as any).env?.GEMINI_API_KEY || (process as any).env?.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
  You are an expert English language tutor. Review the following conversation transcript between a student and an AI tutor (using a ${accent} accent on the scenario: "${scenario.title}" - Level ${scenario.level}).
  
  The student was supposed to achieve these goals:
  ${scenario.goals.map(g => `- ${g}`).join('\n')}
  
  Focus ONLY on the student's messages for grading. 
  
  Provide your feedback strictly as a JSON object with the following schema:
  {
    "score": number (0-100 fluency and accuracy score),
    "grammar_issues": [{"original": "student's sentence with error", "corrected": "corrected sentence", "explanation": "why"}],
    "vocabulary_suggestions": [{"basic_word": "word student used", "advanced_word": "better alternative", "context": "how to use it"}],
    "overall_comments": "Brief encouraging feedback"
  }

  If there are no grammar issues, leave the array empty.
  Return ONLY the JSON. No markdown formatting (\`\`\`json) or extra text.
  
  Transcript:
  ${transcript.map(t => `${t.isUser ? 'Student' : 'Tutor'}: ${t.text}`).join('\n')}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const textResult = response.text;
    return JSON.parse(textResult) as FeedbackReport;
  } catch (error) {
    console.error("Error generating feedback", error);
    return null;
  }
}
