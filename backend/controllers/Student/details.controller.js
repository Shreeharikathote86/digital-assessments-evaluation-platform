const studentDetails = require("../../models/Students/details.model.js")

const getDetails = async (req, res) => {
    try {
        let user = await studentDetails.find(req.body);
        if (!user) {
            return res
                .status(400)
                .json({ success: false, message: "No Student Found" });
        }
        const data = {
            success: true,
            message: "Student Details Found!",
            user,
        };
        res.json(data);
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const addDetails = async (req, res) => {
    try {
        let user = await studentDetails.findOne({
            enrollmentNo: req.body.enrollmentNo,
        });
        if (user) {
            return res.status(400).json({
                success: false,
                message: "Student With This Enrollment Already Exists",
            });
        }
        // Use Cloudinary URL instead of filename, handle case when no file is provided
        try {
            // Convert enrollment number to string to match model
            const profileUrl = req.file ? req.file.path : null;
            
            // Create a clean data object with proper types
            const studentData = {
                enrollmentNo: req.body.enrollmentNo.toString(),
                firstName: req.body.firstName,
                middleName: req.body.middleName || "",
                lastName: req.body.lastName || "",
                email: req.body.email,
                phoneNumber: req.body.phoneNumber.toString(),
                semester: req.body.semester,
                branch: req.body.branch,
                gender: req.body.gender,
                profile: profileUrl
            };
            
            user = await studentDetails.create(studentData);
        } catch (createError) {
            console.log('Error creating student:', createError);
            return res.status(400).json({
                success: false,
                message: "Error creating student. Please check all required fields.",
                error: createError.message,
                details: createError.toString()
            });
        }
        const data = {
            success: true,
            message: "Student Details Added!",
            user,
        };
        res.json(data);
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}


const updateDetails = async (req, res) => {
    try {
        let user;
        if (req.file) {
            // Use Cloudinary URL instead of filename
            const profileUrl = req.file.path;
            user = await studentDetails.findByIdAndUpdate(req.params.id, { ...req.body, profile: profileUrl });
        } else {
            user = await studentDetails.findByIdAndUpdate(req.params.id, req.body);
        }
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "No Student Found",
            });
        }
        const data = {
            success: true,
            message: "Updated Successfully!",
        };
        res.json(data);
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const deleteDetails = async (req, res) => {
    let { id } = req.body;
    try {
        let user = await studentDetails.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "No Student Found",
            });
        }
        const data = {
            success: true,
            message: "Deleted Successfully!",
        };
        res.json(data);
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const getCount = async (req, res) => {
    try {
        let user = await studentDetails.count(req.body);
        const data = {
            success: true,
            message: "Count Successfully!",
            user,
        };
        res.json(data);
    } catch (error) {
        res
            .status(500)
            .json({ success: false, message: "Internal Server Error", error });
    }
}

module.exports = { getDetails, addDetails, updateDetails, deleteDetails, getCount }