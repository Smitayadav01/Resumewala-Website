
import { GoogleGenAI } from "@google/genai";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// export const parseResumeWithAI = async (resumeText) => {
//   const completion = await openai.chat.completions.create({
//     model: "gpt-4o-mini",
//     temperature: 0.2,
//     messages: [
//       {
//         role: "system",
//         content: "You are a professional resume parsing assistant."
//       },
//       {
//         role: "user",
//         content: `
// Extract structured resume information from the text below.

// Return ONLY valid JSON matching this structure:

// {
//   "personal": {
//     "fullName": "",
//     "email": "",
//     "city": "",
//     "currentJobTitle": "",
//     "totalExperience": ""
//   },
//   "skills": [],
//   "experience": [
//     {
//       "company": "",
//       "position": "",
//       "startDate": "",
//       "endDate": "",
//       "description": ""
//     }
//   ],
//   "education": [
//     {
//       "institution": "",
//       "degree": "",
//       "fieldOfStudy": "",
//       "startDate": "",
//       "endDate": ""
//     }
//   ]
// }

// Resume text:
// ${resumeText}
// `
//       }
//     ]
//   });

//   return JSON.parse(completion.choices[0].message.content);
// };


const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function parseResumeWithAI(resumeText) {
  

  const prompt = `
Extract structured resume information from the text below.

Return ONLY valid JSON matching this structure:

{
  "personal": {
    "fullName": "",
    "email": "",
    "city": "",
    "currentJobTitle": "",
    "totalExperience": "",
    "currentCTC": "",
    "dob": "",
    "gender": "",
    ""
  },
  "skills": [],
  "experience": [
    {
      "company": "",
      "position": "",
      "startDate": "",
      "endDate": "",
      "description": ""
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "fieldOfStudy": "",
      "startDate": "",
      "endDate": ""
    }
  ]
}

Resume text:
${resumeText}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: "You are a professional resume parsing assistant.",
      temperature: 0.2,
    },
  });
  
  function extractJSON(text) {
    return text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
  }

  const cleaned = extractJSON(response.text);

  return JSON.parse(cleaned);
}