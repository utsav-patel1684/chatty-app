import User from "../models/user.model.js"
import Message from "../models/message.model.js"
import cloudniary from "../lib/cloudinary.js";
import { getReceiverSocketId , io} from "../lib/socket.js";

export const getUserForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password")

        res.status(200).json(filteredUsers)
    } catch (error) {
        console.log('Error in getUserForSidebar:', error.messgae);
        return res.status(500).json({ error: "Internal server error" })

    }
};
export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }

            ]
        })
        return res.status(200).json(messages)
    } catch (error) {
        console.log("Error in getMessages controller:", error.messages)
        return res.statu(500).json({ messages: "Internal server error" })
    }
}

export const sendMessage = async (req, res) => {

    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageurl;
        if (image) {
            //upload base64 image to clodinary
            const uploadResponse = await cloudniary.uploader.upload(image);
            imageurl = uploadResponse.secure_url
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageurl,
        });

        await newMessage.save()
        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage)
        }
        return res.status(201).json(newMessage);

    } catch (error) {
        console.log("error in sendMessage controller", error.message)
        return res.status(500).json({ error: "Internal server error" })
    }

}