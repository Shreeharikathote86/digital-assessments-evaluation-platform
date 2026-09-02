const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create storage engine for student profiles
const studentProfileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gradehub/students',
    format: async (req, file) => 'png',
    public_id: (req, file) => `student_${req.body.enrollmentNo}_${req.body.branch}`
  }
});

// Create storage engine for faculty profiles
const facultyProfileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gradehub/faculty',
    format: async (req, file) => 'png',
    public_id: (req, file) => `faculty_${req.body.employeeId}`
  }
});

// Create storage engine for admin profiles
const adminProfileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gradehub/admin',
    format: async (req, file) => 'png',
    public_id: (req, file) => `admin_${req.body.employeeId}`
  }
});

// Create storage engine for timetables
const timetableStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gradehub/timetables',
    format: async (req, file) => 'png',
    public_id: (req, file) => `timetable_${req.body.semester}_${req.body.branch}`
  }
});

// Create storage engine for study materials
const materialStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gradehub/materials',
    format: async (req, file) => 'pdf',
    public_id: (req, file) => `${req.body.title}_${req.body.subject}`
  }
});

// Create multer instances for different upload types
const uploadStudentProfile = multer({ storage: studentProfileStorage });
const uploadFacultyProfile = multer({ storage: facultyProfileStorage });
const uploadAdminProfile = multer({ storage: adminProfileStorage });
const uploadTimetable = multer({ storage: timetableStorage });
const uploadMaterial = multer({ storage: materialStorage });

// Create a function to determine which storage to use based on request
const determineStorage = (req, file, cb) => {
  if (req.body.type === 'timetable') {
    return cb(null, timetableStorage);
  } else if (req.body.type === 'profile') {
    if (req.body.enrollmentNo) {
      return cb(null, studentProfileStorage);
    } else if (req.body.employeeId) {
      // Check if it's admin or faculty based on route or other parameter
      const isAdmin = req.originalUrl.includes('admin');
      return cb(null, isAdmin ? adminProfileStorage : facultyProfileStorage);
    }
  } else if (req.body.type === 'material') {
    return cb(null, materialStorage);
  }
  
  // Default storage if type is not specified
  return cb(new Error('Invalid upload type'));
};

// Dynamic upload middleware
const dynamicStorage = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: (req, file) => {
        if (req.body.type === 'timetable') return 'gradehub/timetables';
        if (req.body.type === 'profile') {
          if (req.body.enrollmentNo) return 'gradehub/students';
          if (req.body.employeeId) {
            return req.originalUrl.includes('admin') ? 'gradehub/admin' : 'gradehub/faculty';
          }
        }
        if (req.body.type === 'material') return 'gradehub/materials';
        return 'gradehub/misc';
      },
      format: async (req, file) => {
        if (req.body.type === 'material') return 'pdf';
        return 'png';
      },
      public_id: (req, file) => {
        if (req.body.type === 'timetable') {
          return `timetable_${req.body.semester}_${req.body.branch}`;
        } else if (req.body.type === 'profile') {
          if (req.body.enrollmentNo) {
            return `student_${req.body.enrollmentNo}_${req.body.branch}`;
          } else if (req.body.employeeId) {
            const prefix = req.originalUrl.includes('admin') ? 'admin' : 'faculty';
            return `${prefix}_${req.body.employeeId}`;
          }
        } else if (req.body.type === 'material') {
          return `${req.body.title}_${req.body.subject}`;
        }
        return `file_${Date.now()}`;
      }
    }
  })
});

module.exports = {
  cloudinary,
  uploadStudentProfile,
  uploadFacultyProfile,
  uploadAdminProfile,
  uploadTimetable,
  uploadMaterial,
  upload: dynamicStorage
};
