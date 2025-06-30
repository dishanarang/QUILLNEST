const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const dotenv = require('dotenv');
dotenv.config();


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'profile_pictures',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 300, height: 300, crop: 'limit' }],
    resource_type:'image'
  },
});

const imageUpload = multer({ storage:imageStorage });

const pdfStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'post_files',
    resource_type: 'raw', // this is important for non-image files
    allowed_formats: ['pdf']
  },
});
const pdfUpload = multer({ storage: pdfStorage });


module.exports = {
     cloudinary,
     imageUpload,
     pdfUpload
};
