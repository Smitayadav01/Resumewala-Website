import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const parseResumeWithAI = async (resumeText) => {
  const prompt = `
Extract structured resume information.

Return ONLY valid JSON:

{
  "personal": {
    "fullName": "",
    "email": "",
    "city": "",
    "currentJobTitle": "",
    "totalExperience": ""
  },
  "skills": [],
  "experience": [],
  "education": []
}

Resume text:
${resumeText}
`;

  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: prompt,
    config: { temperature: 0.2 },
  });

  const clean = response.text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(clean);
};