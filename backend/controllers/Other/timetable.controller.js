const Timetable = require("../../models/Other/timetable.model");

const getTimetable = async (req, res) => {
    try {
        console.log('Timetable request body:', req.body);
        
        // Ensure semester is treated as a number for comparison
        let query = { ...req.body };
        if (query.semester && typeof query.semester === 'string') {
            query.semester = parseInt(query.semester, 10);
        }
        
        console.log('Timetable query:', query);
        
        let timetable = await Timetable.find(query);
        console.log('Timetable found:', timetable);
        
        if (timetable && timetable.length > 0) {
            res.json(timetable);
        } else {
            console.log('No timetable found for query:', query);
            res.status(404).json({ success: false, message: "Timetable Not Found" });
        }
    } catch (error) {
        console.error('Error in getTimetable:', error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const addTimetable = async (req, res) => {
    try {
        console.log('Add timetable request body:', req.body);
        console.log('Add timetable file:', req.file);
        
        let { semester, branch } = req.body;
        
        // Ensure semester is a number
        if (typeof semester === 'string') {
            semester = parseInt(semester, 10);
        }
        
        if (!semester || !branch || !req.file) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: semester, branch, or timetable file"
            });
        }
        
        let timetable = await Timetable.findOne({ semester, branch });
        
        if (timetable) {
            console.log('Updating existing timetable:', timetable);
            const updatedTimetable = await Timetable.findByIdAndUpdate(timetable._id, {
                semester, branch, link: req.file.path
            }, { new: true });
            
            console.log('Updated timetable:', updatedTimetable);
            
            const data = {
                success: true,
                message: "Timetable Updated!",
                timetable: updatedTimetable
            };
            res.json(data);
        } else {
            console.log('Creating new timetable');
            const newTimetable = await Timetable.create({
                semester, branch, link: req.file.path
            });
            
            console.log('New timetable created:', newTimetable);
            
            const data = {
                success: true,
                message: "Timetable Added!",
                timetable: newTimetable
            };
            res.json(data);
        }
    } catch (error) {
        console.error('Error in addTimetable:', error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

const deleteTimetable = async (req, res) => {
    try {
        let timetable = await Timetable.findByIdAndDelete(req.params.id);
        if (!timetable) {
            return res
                .status(400)
                .json({ success: false, message: "No Timetable Exists!" });
        }
        const data = {
            success: true,
            message: "Timetable Deleted!",
        };
        res.json(data);
    } catch (error) {
        console.error(error.message);
        console.log(error)
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

module.exports = { getTimetable, addTimetable, deleteTimetable }