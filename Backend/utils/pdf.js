import { createRequire } from "module";

const require = createRequire(import.meta.url);

// ✅ Import the actual parser function (NOT index.js demo)
const pdfParse = require("pdf-parse/lib/pdf-parse");

export const extractTextFromPDF = async (buffer) => {
  const data = await pdfParse(buffer);
  return data.text;
};
