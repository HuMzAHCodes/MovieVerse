const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary Credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'netflix-clone-avatars',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 150, height: 150, crop: 'thumb', gravity: 'face' }],
  },
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };
