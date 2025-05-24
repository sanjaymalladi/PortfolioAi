import { askGemini } from './geminiService';

// Sample interview questions and feedback
export type Question = {
  text: string;
  category: string;
};

// Updated Feedback type to match the new detailed JSON structure from Gemini
export type Feedback = {
  score: number;
  score_explanation: string;
  clarity_conciseness: { rating: string; feedback: string };
  relevance_focus: { rating: string; feedback: string };
  examples_specificity: { rating: string; feedback: string };
  star_method_analysis: {
    situation: string;
    task: string;
    action: string;
    result: string;
    overall_star_effectiveness: string;
  };
  resume_jd_alignment: { rating: string; feedback: string };
  communication_style: { rating: string; feedback: string };
  key_strengths: string[]; // Array of markdown strings
  areas_for_improvement: string[]; // Array of markdown strings
  suggested_answer_snippet?: string; // Optional
  // Keep old fields for temporary compatibility or map them if necessary
  // For now, the new structure is primary. Downstream components must adapt.
  positive?: string; // Old field, can be derived from key_strengths if needed
  improvement?: string; // Old field, can be derived from areas_for_improvement if needed
};

const commonQuestions: Question[] = [
  { text: "Tell me about yourself.", category: "general" },
  { text: "What are your strengths and weaknesses?", category: "self-assessment" },
  { text: "Why do you want to work here?", category: "company-specific" },
  { text: "Where do you see yourself in 5 years?", category: "career-goals" },
  { text: "Describe a challenging situation and how you handled it.", category: "behavioral" },
  { text: "Why are you leaving your current job?", category: "general" },
  { text: "What is your greatest achievement?", category: "accomplishments" },
  { text: "How do you handle stress and pressure?", category: "behavioral" },
  { text: "What are your salary expectations?", category: "compensation" },
  { text: "Do you have any questions for us?", category: "general" }
];

// Updated to dynamically generate questions for Video Interview as well
export const getInterviewQuestions = async (resume: string = '', job: string = '', numQuestions: number = 5): Promise<Question[]> => {
  const prompt = `You are an expert AI Interviewer tasked with generating a set of interview questions for a candidate.

**Available Context:**
- **Candidate's Resume:** "${resume || 'No resume provided. Generate general questions.'}"
- **Job Description:** "${job || 'No job description provided. Generate general questions based on common roles if resume is also missing, otherwise focus on resume.'}"

**Your Task:**
Generate a list of exactly ${numQuestions} diverse interview questions tailored to the candidate's resume and the job description if available.
If context is limited, generate insightful general interview questions (mix of behavioral, situational, and role-related if possible).

**Question Generation Strategy:**
1.  **Prioritize Context:** If resume and/or job description are provided, craft questions that probe specific experiences, skills, or projects mentioned in the resume and align them with the job requirements.
2.  **Variety:** Include a mix of question types (e.g., behavioral - STAR method, experience-based, problem-solving, motivation-based).
3.  **Relevance:** Ensure questions are appropriate for a typical screening or first-round interview.
4.  **Uniqueness:** Each question should be distinct.

**Output Format (Strict JSON):**
Return only a valid JSON object that is an array of question objects. Each object should have text and category fields.

Example:
[
  { "text": "Can you describe a major project from your resume, [Project Name], and how your contributions aligned with the requirements for [Specific Skill from Job Description]?", "category": "experience-based" },
  { "text": "Tell me about a time you had to learn a new technology quickly for a project mentioned in your resume.", "category": "behavioral" },
  { "text": "Based on the job description, what do you foresee as the biggest challenge in this role, and how would your experience from [Relevant Resume Point] help you address it?", "category": "situational" }
]

**Category examples:** "general", "behavioral", "experience-based", "situational", "technical-conceptual", "motivation", "company-specific", "self-assessment", "problem-solving", "resume-deep-dive", "jd-alignment".
Choose the most fitting category for each question you generate.

Generate exactly ${numQuestions} questions. Ensure the output is a single, valid JSON array.`;

  const result = await askGemini(prompt);
  let parsedQuestions: Question[];

  try {
    parsedQuestions = JSON.parse(result);
    if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0 || !parsedQuestions[0].text || !parsedQuestions[0].category) {
      console.warn("Parsed questions from Gemini are not in the expected format. Raw:", result);
      throw new Error("Parsed questions are invalid.");
    }
    // Ensure we return the requested number of questions, or fallback if Gemini returns too few/many.
    if (parsedQuestions.length !== numQuestions) {
        console.warn(`Gemini returned ${parsedQuestions.length} questions, expected ${numQuestions}. Using what was returned or falling back.`);
        // Optionally, you could try to pad with commonQuestions or truncate if this happens often.
    }
    parsedQuestions = parsedQuestions.slice(0, numQuestions); // Ensure correct number

  } catch (error) {
    console.error("Failed to parse questions JSON from Gemini:", error);
    console.error("Raw Gemini response for questions:", result);
    // Fallback to a few common questions if parsing or generation fails
    parsedQuestions = commonQuestions.slice(0, numQuestions).map((q: Question) => {
      const questionText: string = q.text;
      const questionCategory: string = q.category || "general";
      return { text: questionText, category: questionCategory };
    });
    if (parsedQuestions.length < numQuestions && resume && job) {
        parsedQuestions.push({text: `Considering your resume and the job description, can you walk me through an experience that best highlights your fit for this role?`, category: "custom-contextual"});
    }
     while (parsedQuestions.length < numQuestions) {
        // Ensure we have a valid fallback question object from commonQuestions
        const commonQuestionIndex = parsedQuestions.length % commonQuestions.length;
        const fallbackQuestionCandidate = commonQuestions[commonQuestionIndex];
        
        const fallbackQuestion: Question = fallbackQuestionCandidate 
            ? { text: fallbackQuestionCandidate.text, category: fallbackQuestionCandidate.category || "general" }
            : {text: "Tell me about a significant challenge you have faced and how you overcame it.", category: "behavioral"}; // Absolute fallback

        if (!parsedQuestions.find(pq => pq.text === fallbackQuestion.text)) {
             parsedQuestions.push(fallbackQuestion);
        } else {
            // Avoid infinite loop if all common questions are somehow already used and we still need more
            // Create a unique-enough general question
            parsedQuestions.push({text: `What key skill do you possess that you believe would be most valuable in a new role? (Question ${parsedQuestions.length +1})`, category: "general"});
        }
    }
  }
  return parsedQuestions.slice(0, numQuestions); // Final trim to ensure exact number
};

export const getInterviewQuestion = async (
  previousQA: string[], 
  resume: string = '', 
  job: string = ''
): Promise<string> => {
  // Create a string of previous Q&A for the prompt
  const previousInteractionText = previousQA.length > 0 
    ? previousQA.map((item, index) => { 
        if (index % 2 === 0) { // Question
          return `  Q${Math.floor(index/2)+1}: ${item}`;
        } else { // Answer
          return `  A${Math.floor(index/2)+1}: ${item}`;
        }
      }).join('\n')
    : '  No previous questions asked.';

  let prompt = `You are an expert AI Interviewer conducting a screening interview.\nYour goal is to ask relevant and insightful questions to assess the candidate's suitability for a role.\n\n**Available Context:**\n- **Candidate's Resume:** "${resume || 'No resume provided.'}"\n- **Job Description:** "${job || 'No job description provided.'}"\n- **Previous Questions & Answers:**\n${previousInteractionText}\n\n**Your Task:**\nAsk the **next single (1)** interview question.\n\n**Question Generation Strategy:**\n1.  **If Resume and Job Description are available:** Prioritize asking questions that directly relate to the candidate's experience on their resume and how it matches the requirements in the job description. Probe specific projects, skills, or experiences mentioned. Ask for examples that demonstrate suitability for the role described.\n2.  **If only Resume is available:** Ask questions that delve deeper into the resume's content. Explore listed skills, projects, and accomplishments.\n3.  **If only Job Description is available:** Ask questions that assess the candidate's general suitability for the type of role described. Focus on required skills and experiences.\n4.  **If neither is available OR if initial contextual questions have been asked:** Ask general but relevant interview questions (behavioral, situational, technical if appropriate from JD hints).\n5.  **Avoid Repeating Questions:** Do not ask a question that is semantically very similar to one already asked. Refer to the 'Previous Questions & Answers' section.\n6.  **Natural Flow:** Ensure the question flows logically from the previous interaction, if any.\n\n**Question Style:**\n- Clear, concise, and professional.\n- Open-ended to encourage detailed responses.\n\nBased on all the above, what is your next single interview question for the candidate? Respond with only the question itself, without any preamble or explanation.`;

  // Simplified prompt if it's the first question and context is available
  if (previousQA.length === 0 && (resume || job)) {
    prompt = `You are an expert AI Interviewer starting an interview.\n\n**Available Context:**\n- **Candidate's Resume:** "${resume || 'No resume provided.'}"\n- **Job Description:** "${job || 'No job description provided.'}"\n\n**Your Task:**\nAsk the **first single (1)** interview question for the candidate, making it highly relevant to their resume and/or the job description.\nFor example, you could ask about a specific project on their resume in relation to a key requirement in the job description, or ask them to elaborate on a key skill mentioned in both their resume and the job description.\n\nRespond with only the question itself, without any preamble or explanation.`;
  }

  const question = await askGemini(prompt);
  return question.trim(); // Trim to ensure no leading/trailing whitespace from Gemini
};

export const getInterviewFeedback = async (question: string, answer: string, resume: string = '', job: string = ''): Promise<Feedback> => {
  const prompt = `You are an expert interview coach providing detailed, constructive feedback. Analyze the candidate's response thoroughly based on the provided context.

**Overall Goal:** Help the candidate understand their strengths and specific, actionable areas for improvement to excel in future interviews for similar roles.

**Context for Analysis:**
- **Job Description:** "${job || 'Not provided. Focus on general best practices.'}"
- **Candidate's Resume:** "${resume || 'Not provided. Focus on general best practices.'}"
- **Interview Question:** "${question}"
- **Candidate's Answer:** "${answer}"

**CRITICAL: Return ONLY valid JSON, no markdown, no explanations, no code blocks, just pure JSON.**

Return exactly this JSON structure:
{
  "score": [Number from 0-100, representing overall effectiveness of the answer],
  "score_explanation": "[Briefly explain the rationale behind the score, highlighting key factors]",
  "clarity_conciseness": {
    "rating": "[Excellent/Good/Fair/Needs Improvement]",
    "feedback": "[Specific comments on the clarity, articulation, and conciseness of the answer. Was it easy to understand? To the point? Provide examples if possible.]"
  },
  "relevance_focus": {
    "rating": "[Excellent/Good/Fair/Needs Improvement]",
    "feedback": "[How well did the answer address the question directly? Did it stay on topic?]"
  },
  "examples_specificity": {
    "rating": "[Excellent/Good/Fair/Needs Improvement]",
    "feedback": "[Comment on the use of specific examples, data, or quantifiable results. Were they impactful? Relevant?]"
  },
  "star_method_analysis": {
    "situation": "[If applicable, evaluate the 'Situation' component. Was it clear and concise?]",
    "task": "[If applicable, evaluate the 'Task' component. Was the objective clear?]",
    "action": "[If applicable, evaluate the 'Action' component. Were the actions specific and impactful? Did the candidate highlight their role?]",
    "result": "[If applicable, evaluate the 'Result' component. Were the outcomes clear and quantified if possible? Positive or negative learnings discussed?]",
    "overall_star_effectiveness": "[Good/Fair/Needs Improvement/Not Applicable - comment on overall STAR structure if used]"
  },
  "resume_jd_alignment": {
    "rating": "[Excellent/Good/Fair/Needs Improvement/Not Applicable]",
    "feedback": "[How well did the answer leverage experiences from the resume? How well did it align with the skills and requirements in the job description? Identify specific connections or missed opportunities.]"
  },
  "communication_style": {
    "rating": "[Excellent/Good/Fair/Needs Improvement]",
    "feedback": "[Comment on tone, professionalism, confidence conveyed through language, and overall engagement. Were there any filler words or hesitant phrases noted in the transcript?]"
  },
  "key_strengths": [
    "**Strength 1:** Explanation...",
    "**Strength 2:** Explanation..."
  ],
  "areas_for_improvement": [
    "**Improvement Area 1:** Suggestion...",
    "**Improvement Area 2:** Suggestion..."
  ],
  "suggested_answer_snippet": "[Optional: If a small part of the answer could be significantly improved, provide a brief example of how it could be rephrased (1-2 sentences). Otherwise, leave empty or state 'N/A'.]"
}

**Instructions:**
- Base score on holistic view of all factors
- Be specific in feedback rather than saying "good" - explain why it was good or how it could be better
- If question isn't behavioral, rate star_method_analysis sub-fields as "Not Applicable"
- Provide concrete, actionable advice in areas_for_improvement
- Use constructive, encouraging, professional tone
- Focus on feedback that directly relates to the candidate's answer and provided context

RESPOND WITH ONLY THE JSON OBJECT - NO OTHER TEXT, NO MARKDOWN FORMATTING, NO CODE BLOCKS.`;

  const result = await askGemini(prompt);
  let parsedFeedback: Feedback;

  try {
    // Clean the response to extract JSON
    let cleanResult = result.trim();
    
    // Remove any markdown code block formatting
    cleanResult = cleanResult.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Find the first { and last } to extract the JSON object
    const firstBrace = cleanResult.indexOf('{');
    const lastBrace = cleanResult.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleanResult = cleanResult.substring(firstBrace, lastBrace + 1);
    }
    
    // Attempt to parse the cleaned JSON
    parsedFeedback = JSON.parse(cleanResult);
    
    // Basic validation of the parsed structure
    if (typeof parsedFeedback.score !== 'number' || !parsedFeedback.key_strengths || !parsedFeedback.areas_for_improvement) {
      console.warn("Parsed feedback from Gemini is missing key fields. Raw:", result);
      throw new Error("Parsed feedback structure is invalid.");
    }

    // Add backward compatibility fields
    parsedFeedback.positive = parsedFeedback.key_strengths?.join(' ') || "Good effort in answering the question.";
    parsedFeedback.improvement = parsedFeedback.areas_for_improvement?.join(' ') || "Continue practicing to improve your interview skills.";

  } catch (error) {
    console.error("Failed to parse feedback JSON from Gemini:", error);
    console.error("Raw Gemini response:", result);

    // Fallback to a structured error message within the Feedback type.
    parsedFeedback = {
      score: 0,
      score_explanation: "Critical Error: AI feedback response was unparsable. Please check the console for the raw AI response.",
      clarity_conciseness: { rating: "N/A", feedback: "AI response parsing error." },
      relevance_focus: { rating: "N/A", feedback: "AI response parsing error." },
      examples_specificity: { rating: "N/A", feedback: "AI response parsing error." },
      star_method_analysis: { 
        situation: "AI response parsing error.", 
        task: "AI response parsing error.", 
        action: "AI response parsing error.", 
        result: "AI response parsing error.", 
        overall_star_effectiveness: "N/A" 
      },
      resume_jd_alignment: { rating: "N/A", feedback: "AI response parsing error." },
      communication_style: { rating: "N/A", feedback: "AI response parsing error." },
      key_strengths: ["**Error:** Could not parse detailed feedback from AI. The raw response may be in the browser console."],
      areas_for_improvement: ["**Error:** Could not parse detailed feedback from AI. The raw response may be in the browser console."],
      suggested_answer_snippet: "N/A",
      // Populate old fields for basic compatibility if needed, though ideally components adapt.
      positive: "Error: AI feedback parsing failed.", 
      improvement: "Error: AI feedback parsing failed."
    };
  }
  
  return parsedFeedback;
};

export const generateSummary = (allFeedback: Feedback[]) => {
  // Calculate overall score
  const overallScore = Math.round(
    allFeedback.reduce((sum, feedback) => sum + feedback.score, 0) / allFeedback.length
  );
  
  // Generate strengths and improvements based on feedback with markdown formatting
  const strengths = [
    "**Clear Communication**: You communicate your thoughts clearly and articulately",
    "**Good Context**: You provide good context and background information",  
    "**Problem-Solving**: You demonstrate strong problem-solving abilities",
    "**Enthusiasm**: You show enthusiasm and genuine interest in the role"
  ];
  
  const improvements = [
    "**STAR Method**: Use more specific examples with quantifiable results (Situation, Task, Action, Result)",
    "**Concise Responses**: Practice concise responses while maintaining key details",
    "**Company Research**: Research the company more thoroughly to show deeper knowledge",
    "**Job Alignment**: Prepare stronger examples that directly relate to job requirements"
  ];
  
  return {
    overallScore,
    strengths,
    improvements
  };
};
