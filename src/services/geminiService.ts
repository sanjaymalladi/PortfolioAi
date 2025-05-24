export async function askGemini(prompt: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );
  const data = await response.json();
  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    ''
  );
}

export async function transcribeAudio(audioBase64: string, mimeType: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("Gemini API Key (VITE_GEMINI_API_KEY) is not configured.");
    throw new Error("Gemini API Key is not configured. Please set VITE_GEMINI_API_KEY in your environment variables.");
  }

  try {
    const audioPart = {
      inline_data: {
        mime_type: mimeType, // e.g., 'audio/webm' or 'audio/wav'
        data: audioBase64,
      },
    };
    const textPart = {
      text: "Transcribe the audio recording. Respond ONLY with the transcribed text, without any additional explanations, introductions, or markdown formatting. If the audio is unclear or silent, indicate that appropriately (e.g., '[unintelligible]' or '[silence]')."
    };

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [audioPart, textPart] }]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const transcription = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!transcription) {
      throw new Error("No transcription returned from Gemini API");
    }

    return transcription;

  } catch (error) {
    console.error("Error transcribing audio with Gemini:", error);
    if (error instanceof Error) {
      if (error.message.includes("API key not valid") || error.message.includes("API_KEY_INVALID")) {
           throw new Error("Invalid or missing Gemini API Key. Please check your VITE_GEMINI_API_KEY environment variable.");
      }
      // More specific error messages can be caught here if known
      throw new Error(`Gemini API error: ${error.message}`);
    }
    throw new Error("An unknown error occurred during transcription via Gemini API.");
  }
} 