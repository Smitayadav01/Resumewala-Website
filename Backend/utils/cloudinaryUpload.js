import cloudinary from "../config/cloudinary.js";

export const uploadResumeToCloudinary = (buffer, userId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: "resumes",
        resource_type: "raw",
        public_id: `resume_${userId}_${Date.now()}`
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    ).end(buffer);
  });
};
