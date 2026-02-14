// utils/parser.js

/* ---------------- SECTION HELPERS ---------------- */
const cleanText = (text) => text.replace(/[^a-zA-Z0-9\s\-]/g, "").trim();
const normalizeText = (text) =>
  text
    .replace(/\r/g, "")
    .replace(/\n{2,}/g, "\n")
    .trim();

const getSection = (text, headers) => {
  const lines = text.split("\n");

  const startIndex = lines.findIndex(line =>
    headers.some(h => line.toLowerCase().includes(h))
  );

  if (startIndex === -1) return "";

  const sectionLines = [];
  for (let i = startIndex + 1; i < lines.length; i++) {
    if (lines[i].toUpperCase() === lines[i] && lines[i].length < 40) break;
    sectionLines.push(lines[i]);
  }

  return sectionLines.join("\n").trim();
};

/* ---------------- SKILLS ---------------- */

const SKILLS_DB = [
  "javascript", "typescript", "react", "node", "express", "mongodb",
  "java", "sql", "aws", "docker", "nextjs", "postgresql",
  "websocket", "jwt", "git", "chartjs"
];

export const extractSkills = (text) => {
  const lower = text.toLowerCase();
  return [...new Set(
    SKILLS_DB.filter(skill => lower.includes(skill))
  )];
};

/* ---------------- EDUCATION ---------------- */
const DATE_REGEX = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?\s*(19|20)\d{2}\s*[–-]\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?\s*(19|20)\d{2}/i;

export const extractEducation = (text) => {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const education = [];

  for (let i = 0; i < lines.length; i++) {
    if (/college|engineering/i.test(lines[i])) {
      const institutionLine = lines[i];
      const degreeLine = lines[i + 1] || "";

      const dateMatch = institutionLine.match(DATE_REGEX);
      const [startDate, endDate] = dateMatch
        ? dateMatch[0].split(/[–-]/).map(s => s.trim())
        : ["", ""];

      education.push({
        institution: cleanText(institutionLine),
        degree: cleanText(degreeLine.split("-")[0]),
        grade: degreeLine.includes("-")
          ? cleanText(degreeLine.split("-")[1])
          : "",
        startDate,
        endDate
      });

      i += 1; // 🔥 skip next line (prevents duplicates)
    }
  }

  return education;
};


/* ---------------- EXPERIENCE (INTERNSHIP INCLUDED) ---------------- */

export const extractExperience = (text) => {
  const cleaned = normalizeText(text);

  const expSection = getSection(cleaned, [
    "experience",
    "work experience",
    "internship",
    "professional experience"
  ]);

  if (!expSection) return [];

  const lines = expSection.split("\n").filter(Boolean);
  const experience = [];

  for (let i = 0; i < lines.length; i++) {
    // Company + date line
    if (/(19|20)\d{2}\s*[–-]\s*(19|20)\d{2}/.test(lines[i])) {
      const company = lines[i].replace(/\d{4}.*/, "").trim();

      const dateMatch = lines[i].match(/(19|20)\d{2}\s*[–-]\s*(19|20)\d{2}/);
      const [startDate, endDate] = dateMatch
        ? dateMatch[0].split(/[–-]/).map(s => s.trim())
        : ["", ""];

      const position = lines[i + 1] || "";

      const description = [];
      let j = i + 2;

      while (lines[j]?.startsWith("•")) {
        description.push(lines[j].replace("•", "").trim());
        j++;
      }

      experience.push({
        company,
        position,
        startDate,
        endDate,
        employmentType: "Internship",
        description: description.join(" ")
      });
    }
  }

  return experience;
};
