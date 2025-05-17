
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

export const generateFeedback = (questionId: number, answer: string): Feedback => {
  // In a real application, this would call an AI service to analyze the answer
  // For now, we'll use sample feedback based on answer length
  const answerLength = answer.length;
  
  // Simple deterministic feedback based on answer length
  if (answerLength < 50) {
    return {
      score: 60,
      positive: "You were concise and to the point.",
      improvement: "Consider providing more details and examples to strengthen your answer."
    };
  } else if (answerLength < 200) {
    return {
      score: 75,
      positive: "Good level of detail in your response.",
      improvement: "Try to include a specific example to make your answer more impactful."
    };
  } else if (answerLength < 400) {
    return {
      score: 85,
      positive: "Excellent detail and good structure in your response.",
      improvement: "Consider focusing a bit more on outcomes and results in your examples."
    };
  } else {
    return {
      score: 90,
      positive: "Comprehensive answer with great examples and detail.",
      improvement: "For some interview settings, a slightly more concise version might be beneficial."
    };
  }
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
