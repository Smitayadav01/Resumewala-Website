import mammoth from "mammoth";
import pdf from "pdf-parse-new";
export const extractResumeText = async (file) => {
  // 📄 PDF handling
  if (file.mimetype === "application/pdf") {
    try {
      const data = await pdf(file.buffer);
      return data.text;
    } catch (error) {
      console.log("PDF parse error:", error);
      throw error;
    }
  }

  // 📄 DOC / DOCX handling
  if (
    file.mimetype === "application/msword" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({
      buffer: file.buffer,
    });
    return result.value;
  }

  throw new Error("Unsupported file format");
};