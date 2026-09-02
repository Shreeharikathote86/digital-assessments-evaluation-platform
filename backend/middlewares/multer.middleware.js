// Import the Cloudinary configuration
const { upload } = require('../config/cloudinary');

// Export the Cloudinary-based multer middleware
module.exports = upload;
