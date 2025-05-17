import { askGemini } from './geminiService';

// Sample interview questions and feedback
export type Question = {
  id: number;
  text: string;
};

export type Feedback = {
  score: number;
  positive: string;
  improvement: string;
};

export const getInterviewQuestions = (): Question[] => {
  return [
    {
      id: 1,
      text: "Tell me about yourself and your background in software engineering."
    },
    {
      id: 2,
      text: "Describe a challenging project you've worked on recently. What was your role and what did you learn?"
    },
    {
      id: 3,
      text: "How do you approach debugging a complex issue in your code?"
    },
    {
      id: 4,
      text: "What's your experience with modern JavaScript frameworks? Which one do you prefer and why?"
    },
    {
      id: 5,
      text: "How do you stay updated with the latest technologies and best practices in software development?"
    }
  ];
};

export const getInterviewQuestion = async (previous: string[] = []): Promise<string> => {
  const prompt = previous.length
    ? `Continue this mock interview. Here are the previous questions and answers: ${JSON.stringify(previous)}. Ask the next interview question only.`
    : `Start a mock software engineering interview. Ask the first question only.`;
  return await askGemini(prompt);
};

export const getInterviewFeedback = async (question: string, answer: string): Promise<Feedback> => {
  const prompt = `You are an interview coach. Here is the interview question: "${question}" and the candidate's answer: "${answer}". Give a JSON with keys: score (0-100), positive (what was good), improvement (how to improve).`;
  const result = await askGemini(prompt);
  let parsed;
  try {
    parsed = JSON.parse(result);
  } catch {
    const match = result.match(/\{[\s\S]*\}/);
    parsed = match ? JSON.parse(match[0]) : null;
  }
  return parsed || { score: 0, positive: '', improvement: '' };
};

export const generateSummary = (allFeedback: Feedback[]) => {
  // Calculate overall score
  const overallScore = Math.round(
    allFeedback.reduce((sum, feedback) => sum + feedback.score, 0) / allFeedback.length
  );
  
  // Generate strengths and improvements based on feedback
  const strengths = [
    "You communicate your thoughts clearly",
    "You provide good context in your answers",
    "You demonstrate problem-solving abilities"
  ];
  
  const improvements = [
    "Use more specific examples when describing your experiences",
    "Focus more on outcomes and results in your answers",
    "Structure your responses using the STAR method (Situation, Task, Action, Result)"
  ];
  
  return {
    overallScore,
    strengths,
    improvements
  };
};
