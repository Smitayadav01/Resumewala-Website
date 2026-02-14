/* ---------------- TEXT HELPERS ---------------- */

const cleanText = (text = "") =>
  text.replace(/[^\w\s.,\-()/]/g, "").trim();

const normalizeText = (text = "") =>
  text
    .replace(/\r/g, "")
    .replace(/\n{2,}/g, "\n")
    .trim();

/* Normalize headers like "W O R K  E X P" → "work exp" */
const normalizeHeader = (line = "") =>
  line.replace(/\s+/g, "").toLowerCase();

const SECTION_HEADERS = {
  experience: ["experience", "workexperience", "internship"],
  education: ["education", "academic"],
  skills: ["skills", "technicalskills"],
  projects: ["projects"],
};

const getSection = (text, keys) => {
  const lines = text.split("\n");

  let start = -1;
  let end = lines.length;

  for (let i = 0; i < lines.length; i++) {
    const normalized = normalizeHeader(lines[i]);
    if (keys.some(k => normalized.includes(k))) {
      start = i + 1;
      break;
    }
  }

  if (start === -1) return "";

  for (let i = start; i < lines.length; i++) {
    const normalized = normalizeHeader(lines[i]);
    if (
      Object.values(SECTION_HEADERS)
        .flat()
        .some(h => normalized === h)
    ) {
      end = i;
      break;
    }
  }

  return lines.slice(start, end).join("\n").trim();
};

const SKILLS_DB = [
  "javascript", "typescript", "react", "node", "express", "mongodb",
  "postgresql", "mysql", "prisma", "docker", "aws", "git",
  "jwt", "websocket", "chartjs", "nextjs", "tailwind",
  "rust", "solidity", "blockchain"
];

export const extractSkills = (text) => {
  const lower = text.toLowerCase();
  const found = new Set();

  SKILLS_DB.forEach(skill => {
    const regex = new RegExp(`\\b${skill}\\b`, "i");
    if (regex.test(lower)) found.add(skill);
  });

  return [...found];
};

const DATE_RANGE =
  /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?\s*\d{4}\s*(–|-)\s*(Present|(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?\s*\d{4})/i;

export const extractEducation = (text) => {
  const section = getSection(text, SECTION_HEADERS.education);
  if (!section) return [];

  const lines = section.split("\n").filter(Boolean);
  const education = [];

  for (let i = 0; i < lines.length; i++) {
    if (/university|college|institute|school/i.test(lines[i])) {
      const institution = cleanText(lines[i]);
      const degree = cleanText(lines[i + 1] || "");
      const dateMatch =
        (lines[i] + " " + lines[i + 1]).match(DATE_RANGE) || [];

      education.push({
        institution,
        degree,
        startDate: dateMatch[0]?.split(/–|-/)[0]?.trim() || "",
        endDate: dateMatch[0]?.split(/–|-/)[1]?.trim() || ""
      });

      i += 1;
    }
  }

  return education;
};

export const extractExperience = (text) => {
  const section = getSection(text, SECTION_HEADERS.experience);
  if (!section) return [];

  const lines = section.split("\n").filter(Boolean);
  const experience = [];

  for (let i = 0; i < lines.length; i++) {
    const dateMatch = lines[i].match(DATE_RANGE);

    if (dateMatch) {
      const header = cleanText(lines[i].replace(dateMatch[0], ""));
      const position = cleanText(lines[i + 1] || "");

      const description = [];
      let j = i + 2;

      while (
        lines[j] &&
        !lines[j].match(DATE_RANGE) &&
        !Object.values(SECTION_HEADERS).flat().some(h =>
          normalizeHeader(lines[j]).includes(h)
        )
      ) {
        description.push(
          cleanText(lines[j].replace(/^[-•*]/, ""))
        );
        j++;
      }

      experience.push({
        company: header,
        position,
        startDate: dateMatch[0].split(/–|-/)[0].trim(),
        endDate: dateMatch[0].split(/–|-/)[1].trim(),
        description: description.join(" ")
      });

      i = j - 1;
    }
  }

  return experience;
};
