import Message from "../modals/message.modal.js";
import User from "../modals/user.modal.js";
import cloudinary from "../lib/cloudinary.js";

export const getUsersForSidebar = async (req, res) => {
    try{
        const loggedInUser = req.user._id;
        const filteredUser = await User.find({_id: { $ne: loggedInUser } }).select("-password");

        res.status(200).json(filteredUser)
    } catch(error) {
        console.log(`error in getUsersForSidebar: ${error}`)
        res.status(500).json({ message: "Internal server error" })
    }
}

export const getMessages = async (req, res) => {
    try{
        const {id: usertoChatId} = req.params
        const myId = req.user._id

        const messages = await Message.find({
            $or:[
                {senderId:myId, recieverId: usertoChatId},
                {senderId: usertoChatId, recieverId: myId}
            ]
        })
        res.status(200).json(messages)
    }catch(error){
        console.log(`error in getMessages: ${error}`)
        res.status(500).json({ message: "Internal server error" })
    }
}

export const sendMessage = async (req, res) => {
    try{
        const { text, image } = req.body;
        const {id: recieverId} = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if (image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId, recieverId, text, image: imageUrl
        })

        await newMessage.save();

        // todo: realtime functionality goes here => socket.io

        res.status(201).json(newMessage)
    }catch(error){
        console.log(`error in sendMessage: ${error}`)
        res.status(500).json({ message: "Internal server error" })
    }
}