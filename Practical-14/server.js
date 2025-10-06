const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// Serve static files
app.use(express.static('public'));

// Ensure uploads folder exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (cb) => {
        cb(null, 'uploads/');
    },
    filename: (file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});


const fileFilter = (file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed!'), false);
};

// Multer setup
const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter
});

// Upload route
app.post('/upload', upload.single('resume'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No file uploaded.'
        });
    }

    res.json({
        success: true,
        message: 'Resume uploaded successfully!',
        filename: req.file.filename,
        size: req.file.size,
        uploadTime: new Date().toLocaleString()
    });
});


app.use((err,res) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size allowed is 2MB.',
            error: 'FILE_TOO_LARGE'
        });
    }

    if (err.message === 'Only PDF files are allowed!') {
        return res.status(400).json({
            success: false,
            message: 'Invalid file type. Only PDF files are allowed.',
            error: 'INVALID_FILE_TYPE'
        });
    }

    console.error(err); // Log unexpected errors
    return res.status(500).json({
        success: false,
        message: 'Upload failed. Please try again.',
        error: 'UPLOAD_ERROR'
    });
});


app.get('/', (res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(PORT, () => {
    console.log(`Job Portal Server running at http://localhost:${PORT}`);
});
