// utils/parser.js

/* ---------------- SECTION HELPERS ---------------- */

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

export const extractEducation = (text) => {
  const cleaned = normalizeText(text);

  const eduSection = getSection(cleaned, ["education"]);

  if (!eduSection) return [];

  const lines = eduSection.split("\n").filter(Boolean);
  const education = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Institution line
    if (/college|engineering|university/i.test(line)) {
      const institution = line.replace(/\s+\d{4}.*/, "").trim();

      const dateMatch = line.match(/(19|20)\d{2}\s*[–-]\s*(19|20)\d{2}/);
      const [startDate, endDate] = dateMatch
        ? dateMatch[0].split(/[–-]/).map(s => s.trim())
        : ["", ""];

      const degreeLine = lines[i + 1] || "";

      education.push({
        institution,
        degree: degreeLine.split("-")[0]?.trim(),
        grade: degreeLine.includes("-")
          ? degreeLine.split("-")[1]?.trim()
          : "",
        startDate,
        endDate
      });
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
