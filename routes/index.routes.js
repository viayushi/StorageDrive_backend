const express = require("express");
const router = express.Router();
const { upload, uploadFileToSupabase } = require("../config/multer.config");
const supabase = require("../config/superbase.config");
const FileModel = require("../models/files.model");
const authMiddleware = require("../middlewares/auth");

router.get("/home", authMiddleware, async (req, res) => {
  try {
    const userFiles = await FileModel.find({ user: req.user.userId });
    console.log("User files:", userFiles);

    res.render("home", { files: userFiles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user files" });
  }
});

// File Upload Route
router.post(
  "/upload-file",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      console.log("Received File:", req.file.originalname);
      console.log("User ID:", req.user.userId);

      // Upload file to Supabase
      const uploadedFile = await uploadFileToSupabase(req.file);
      if (!uploadedFile || !uploadedFile.path) {
        return res.status(500).json({ error: "File upload failed" });
      }

      // Save file metadata to MongoDB
      const newFile = new FileModel({
        path: uploadedFile.path, // Supabase file path
        originalName: req.file.originalname,
        user: req.user.userId,
      });

      await newFile.save();

      res.json({ message: "File uploaded successfully", fileData: newFile });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// File Download Route
router.get("/download/:path", authMiddleware, async (req, res) => {
  try {
    const loggedinUserid = req.user.userId;
    const filePath = req.params.path;

    const file = await FileModel.findOne({
      user: loggedinUserid,
      path: filePath,
    });

    if (!file) {
      return res
        .status(403)
        .json({ message: "Unauthorized: No access to file" });
    }

    // Get the public URL from Supabase
    const { publicUrl } = supabase.storage
      .from("drivebucket")
      .getPublicUrl(filePath);

    if (!publicUrl) {
      return res.status(500).json({ error: "Failed to generate download URL" });
    }

    res.json({ downloadUrl: publicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
