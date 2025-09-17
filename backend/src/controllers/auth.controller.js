import bcrypt from "bcryptjs"
import User from "../modals/user.modal.js";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
    const {email, fullName, password, profilePic} = req.body
    try{
        if (!email || !fullName || !password){
            return res.status(400).json({ message: "All fields are required" });
        }
        if (password.length < 6){
            return res.status(400).json({ message: "Password must be atleast 6 characters" });
        }

        const user = await User.findOne({email})

        if (user) return res.status(400).json({ message: "Email already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({ email, fullName, password: hashedPassword, profilePic })

        if (newUser){
            // generate jwt token
            generateToken(newUser._id, res)
            await newUser.save()

            res.status(201).json({
                _id: newUser._id,
                email: newUser.email,
                fullName: newUser.fullName,
                profilePic: newUser.profilePic,
            })
        }else{
            return res.status(400).json({ message: "Invalid user data" });
        }

    }catch(error){
        console.log(`error in signup: ${error}`)
        res.status(500).json({ message : "Internal seever error" })
    }
}

export const login = async (req, res) => {
    const {email, password} = req.body;
    try{
        if (!email || !password){
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({email})

        if (!user){
            return res.status(400).json({ message: "Invalid credentials" })
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect){
            return res.status(400).json({ message: "Invalid credentials" })
        }
        generateToken(user._id, res)
        res.status(200).json({
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            profilePic: user.profilePic,
        })
    }catch (error){
        console.log(`error in login: ${error}`)
        res.status(500).json({ message : "Internal seever error" })
    }
}

export const logout = (req, res) => {
    try{
        res.cookie("jwt", "", { maxAge:0 })
        res.status(200).json({ message: "logged out successfully" })
    }catch(error){
        console.log(`error in logout: ${error}`)
        res.status(500).json({ message: "Internal server error "})
    }
}

export const updateProfile = async (req, res) => {
    try{
        const { profilePic } = req.body;
        if (!profilePic){
            return res.status(400).json({ message: "Profile pic is required" })
        }
        const userId = req.user._id
        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(userId, {profilePic: uploadResponse.secure_url}, {new:true});
        res.status(200).json(updatedUser)
    }catch(error){
        console.log(`error in update-profile: ${error}`)
        res.status(500).json({ message : "Internal seever error" })
    }
}

export const checkAuth = (req, res) => {
    try{
        res.status(200).json(req.user);
    }catch(error){
        console.log(`error in checkAuth: ${error}`);
        res.status(500).jaon({ message: "Internal server error" })
    }
}