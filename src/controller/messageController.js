import { Messages } from "../models";

const messageController = {
  async addMesssage(req, res) {
    const { text } = req.body;
    const conversationId = req.params.id;
    const sender = req.user._id;
    const message = {
      conversationId,
      sender,
      text,
    };
    const newMessage = new Messages(message);
    try {
      const savedMessage = await newMessage.save();
      return res.status(201).json(savedMessage);
    } catch (error) {
      return res.status(500).json({ message: "Unable to add message!!" });
    }
  },
  async getMessages(req, res) {
    try {
      const allMessages = await Messages.find({
        conversationId: req.params.id,
      });
      return res.status(200).json(allMessages);
    } catch (error) {
      return res.status(500).json({ message: "Unable to fetch  messages!!" });
    }
  },

  async deleteOneMessage(req, res) {
    try {
      const deleteMsg = await Messages.findOne({ _id: req.params.id });
      if (!deleteMsg) {
        return res.status(500).json({ message: "Unable to find  message!!" });
      }
      await deleteMsg.deleteOne();
      return res.status(204).json({ message: "message deleted !!" });
    } catch (error) {
      return res.status(500).json({ message: "Unable to find  message!!" });
    }
  },

  async unreadMessagess(req, res) {
    const { convoId } = req.params;
    try {
      const unread = await Messages.find({
        conversationId: convoId,
        isRead: false,
        sender: { $ne: req.user._id },
      });
      return res.status(200).json({ unread });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Unable to find  unread message!!" });
    }
  },

  async readMessage(req, res) {
    const { convoId } = req.params;
    const userId = req.user._id;
    try {
      const read = await Messages.updateMany(
        { conversationId: convoId, isRead: false, sender: { $ne: userId } },
        { $set: { isRead: true } }
      );
      //console.log("read", read);
      res.status(200).json({ message: "Meassages Read!!" });
    } catch (error) {
      return res.status(500).json({ message: "Unable to read  message!!" });
    }
  },
};

export default messageController;
