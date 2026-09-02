const studentCredential = require("../../models/Students/credential.model.js");

const loginHandler = async (req, res) => {
    let { loginid, password } = req.body;
    try {
        let user = await studentCredential.findOne({ loginid });
        if (!user) {
            return res
                .status(400)
                .json({ success: false, message: "Wrong Credentials" });
        }
        if (password !== user.password) {
            return res
                .status(400)
                .json({ success: false, message: "Wrong Credentials" });
        }
        const data = {
            success: true,
            message: "Login Successfull!",
            loginid: user.loginid,
            id: user.id,
        };
        res.json(data);
    } catch (error) {
        console.log('Registration error:', error);
        return res.status(400).json({ 
            success: false, 
            message: "Registration failed", 
            error: error.message,
            details: error.toString()
        });
    }
}

const registerHandler = async (req, res) => {
    console.log('Register handler called with body:', req.body);
    let { loginid, password } = req.body;
    try {
        // Validate required fields
        if (!loginid || !password) {
            console.log('Missing required fields:', { loginid, password });
            return res.status(400).json({
                success: false,
                message: "Login ID and password are required",
            });
        }

        // Convert loginid to string to ensure consistency
        loginid = loginid.toString();
        password = password.toString();
        
        console.log('Processing registration for loginid:', loginid);

        // Check if user already exists with this loginid
        let user = await studentCredential.findOne({ loginid });
        if (user) {
            console.log('User already exists with loginid:', loginid);
            return res.status(400).json({
                success: false,
                message: "User With This LoginId Already Exists",
            });
        }
        
        // Create new user credentials
        console.log('Creating new user with:', { loginid, password: '***' });
        user = await studentCredential.create({
            loginid,
            password,
        });
        const data = {
            success: true,
            message: "Register Successfull!",
            loginid: user.loginid,
            id: user.id,
        };
        res.json(data);
    } catch (error) {
        console.log('Registration error:', error);
        return res.status(400).json({ 
            success: false, 
            message: "Registration failed", 
            error: error.message,
            details: error.toString()
        });
    }
}

const updateHandler = async (req, res) => {
    try {
        let user = await studentCredential.findByIdAndUpdate(
            req.params.id,
            req.body
        );
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "No User Exists!",
            });
        }
        const data = {
            success: true,
            message: "Updated Successfull!",
        };
        res.json(data);
    } catch (error) {
        console.log('Registration error:', error);
        return res.status(400).json({ 
            success: false, 
            message: "Registration failed", 
            error: error.message,
            details: error.toString()
        });
    }
}

const deleteHandler = async (req, res) => {
    try {
        let user = await studentCredential.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "No User Exists!",
            });
        }
        const data = {
            success: true,
            message: "Deleted Successfull!",
        };
        res.json(data);
    } catch (error) {
        console.log('Registration error:', error);
        return res.status(400).json({ 
            success: false, 
            message: "Registration failed", 
            error: error.message,
            details: error.toString()
        });
    }
}

module.exports = { loginHandler, registerHandler, updateHandler, deleteHandler }