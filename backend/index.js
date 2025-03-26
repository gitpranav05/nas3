const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const mime = require("mime-types");
const rangeParser = require("range-parser");

const app = express();
app.use(express.json());
app.use(cors());

const UPLOAD_DIR = path.join(__dirname, "uploads");
const CHUNK_SIZE = 1 * 1024 * 1024; // 1MB chunks for streaming

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure storage to maintain original filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    // Sanitize filename but keep original name structure
    const originalName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, originalName);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
});

// Enhanced file upload endpoint
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  res.json({
    success: true,
    filename: req.file.filename,
    originalname: req.file.originalname,
    type: req.file.mimetype,
    size: req.file.size,
  });
});

// Get list of files with additional metadata
app.get("/files", (req, res) => {
  fs.readdir(UPLOAD_DIR, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Unable to scan files" });
    }

    const fileData = files
      .map((file) => {
        try {
          const filePath = path.join(UPLOAD_DIR, file);
          const stats = fs.statSync(filePath);
          const type = mime.lookup(file) || "application/octet-stream";

          return {
            name: file,
            size: stats.size,
            type: type,
            modified: stats.mtime,
            canPreview:
              type.startsWith("video/") ||
              type.startsWith("audio/") ||
              type.startsWith("image/"),
          };
        } catch (e) {
          console.error(`Error processing file ${file}:`, e);
          return null;
        }
      })
      .filter(Boolean);

    res.json(fileData);
  });
});

// Enhanced streaming endpoint for large files
app.get("/stream/:filename", (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  const stats = fs.statSync(filePath);
  const fileSize = stats.size;
  const mimeType = mime.lookup(filePath) || "application/octet-stream";

  // Handle range requests for video streaming
  const range = req.headers.range;
  if (range && mimeType.startsWith("video/")) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1]
      ? parseInt(parts[1], 10)
      : Math.min(start + CHUNK_SIZE, fileSize - 1);

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": end - start + 1,
      "Content-Type": mimeType,
    });

    const fileStream = fs.createReadStream(filePath, { start, end });
    fileStream.pipe(res);
  } else {
    // Regular download for non-video files or full video requests
    res.setHeader("Content-Length", fileSize);
    res.setHeader("Content-Type", mimeType);
    fs.createReadStream(filePath).pipe(res);
  }
});

// Download endpoint (for direct downloads)
app.get("/download/:filename", (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  res.download(filePath);
});

// Delete endpoint
app.delete("/delete/:filename", (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to delete file" });
    }
    res.json({ success: true });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Upload directory: ${UPLOAD_DIR}`);
});
