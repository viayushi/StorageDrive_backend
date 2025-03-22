const multer = require("multer");
const supabase = require("../config/superbase.config");

// Multer Configuration (Stores file in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadFileToSupabase = async (file) => {
  if (!file) {
    console.error("No file received");
    return null;
  }

  const { originalname, buffer, mimetype } = file;
  const bucketName = "drivebucket"; // Ensure this matches your Supabase storage bucket

  console.log("Uploading File:", originalname);

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(`uploads/${Date.now()}-${originalname}`, buffer, {
      contentType: mimetype,
      upsert: true, // Overwrite if exists
    });

  if (error) {
    console.error("Upload Error:", error);
    return null;
  }

  console.log("Upload Successful:", data);
  return data;
};

module.exports = { upload, uploadFileToSupabase };
