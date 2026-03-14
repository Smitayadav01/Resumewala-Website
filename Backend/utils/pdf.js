import mammoth from "mammoth";

export const extractResumeText = async (file) => {
  if (file.mimetype === "application/pdf") {
    return await extractTextFromPDF(file.buffer);
  }

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