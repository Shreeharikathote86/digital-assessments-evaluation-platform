const Marks = require("../../models/Other/marks.model.js");

const getMarks = async (req, res) => {
    try {
        console.log('Get marks request body:', req.body);
        
        // Ensure consistent enrollment number handling (try both string and number)
        let mark;
        if (req.body.enrollmentNo) {
            // Try to find by exact match first
            mark = await Marks.findOne(req.body);
            
            // If not found and enrollmentNo is a number, try as string
            if (!mark && !isNaN(req.body.enrollmentNo)) {
                mark = await Marks.findOne({ ...req.body, enrollmentNo: req.body.enrollmentNo.toString() });
            }
            
            // If not found and enrollmentNo is a string, try as number
            if (!mark && typeof req.body.enrollmentNo === 'string' && !isNaN(req.body.enrollmentNo)) {
                mark = await Marks.findOne({ ...req.body, enrollmentNo: parseInt(req.body.enrollmentNo) });
            }
        }
        
        if (!mark) {
            console.log('No marks found for:', req.body);
            return res
                .status(200)
                .json({ success: false, message: "Marks Not Available" });
        }
        
        console.log('Found marks for student:', mark);
        const data = {
            success: true,
            message: "Marks Loaded Successfully!",
            marks: mark,
        };
        res.json(data);
    } catch (error) {
        console.error('Error in getMarks:', error.message);
        console.log(error)
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const addMarks = async (req, res) => {
    let { enrollmentNo, isa1, isa2, esa } = req.body;
    try {
        console.log('Add marks request body:', req.body);
        
        // Ensure enrollment number is consistently handled
        let existingMarks;
        
        // Try to find by exact match first
        existingMarks = await Marks.findOne({ enrollmentNo });
        
        // If not found and enrollmentNo is a number, try as string
        if (!existingMarks && !isNaN(enrollmentNo)) {
            existingMarks = await Marks.findOne({ enrollmentNo: enrollmentNo.toString() });
        }
        
        // If not found and enrollmentNo is a string, try as number
        if (!existingMarks && typeof enrollmentNo === 'string' && !isNaN(enrollmentNo)) {
            existingMarks = await Marks.findOne({ enrollmentNo: parseInt(enrollmentNo) });
        }
        if (existingMarks) {
            // Handle ISA1 marks
            if (isa1) {
                // Create isa1 field if it doesn't exist
                if (!existingMarks.isa1) {
                    existingMarks.isa1 = {};
                }
                existingMarks.isa1 = { ...existingMarks.isa1, ...isa1 };
            }
            
            // Handle ISA2 marks
            if (isa2) {
                if (!existingMarks.isa2) {
                    existingMarks.isa2 = {};
                }
                existingMarks.isa2 = { ...existingMarks.isa2, ...isa2 };
            }
            
            // Handle ESA marks
            if (esa) {
                if (!existingMarks.esa) {
                    existingMarks.esa = {};
                }
                existingMarks.esa = { ...existingMarks.esa, ...esa };
            }
            
            await existingMarks.save()
            console.log('Updated marks:', existingMarks);
            
            const data = {
                success: true,
                message: "Marks Added Successfully!",
                marks: existingMarks
            };
            res.json(data);
        } else {
            const newMarks = await Marks.create(req.body);
            console.log('Created new marks:', newMarks);
            
            const data = {
                success: true,
                message: "Marks Added Successfully!",
                marks: newMarks
            };
            res.json(data);
        }
    } catch (error) {
        console.error('Error in addMarks:', error.message);
        console.log(error)
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const deleteMarks = async (req, res) => {
    try {
        let mark = await Marks.findByIdAndDelete(req.params.id);
        if (!mark) {
            return res
                .status(400)
                .json({ success: false, message: "No Marks Data Exists!" });
        }
        const data = {
            success: true,
            message: "Marks Deleted!",
        };
        res.json(data);
    } catch (error) {
        console.error(error.message);
        console.log(error)
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

module.exports = { getMarks, addMarks, deleteMarks }