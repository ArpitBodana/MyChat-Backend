import { Conversations, Messages } from "../models";

const conversationController = {
  async startConversation(req, res) {
    const newConversation = new Conversations({
      members: [req.user._id, req.body.reciverId],
    });
    try {
      const exist = await Conversations.find({
        members: { $all: [req.user._id, req.body.reciverId] },
      });
      if (exist.length > 0) {
        return res
          .status(500)
          .json({ message: "Conversation already exist!!!" });
      }
      const convers = await newConversation.save();
      return res.status(200).json(convers);
    } catch (error) {
      return res.status(500).json({
        message: "Something went wrong while starting converstion !!",
      });
    }
  },
  async getUserConverstaion(req, res) {
    try {
      const convos = await Conversations.find({
        members: { $in: [req.params.id] },
      });
      if (convos.length === 0) {
        return res.status(200).json({ message: "No converstaion found !!" });
      }
      return res.status(200).json(convos);
    } catch (error) {
      return res.status(500).json({
        message: "Something went wrong while fetching user converstion !!",
      });
    }
  },
  async deleteConverSation(req, res) {
    const { id } = req.body;
    try {
      const convo = await Conversations.findOne({ _id: id });
      if (!convo) {
        return res.status(500).json({ message: "No Conversation Found!!" });
      }
      // convo.deleteOne();
      const deleteMsg = await Messages.deleteMany({
        conversationId: id,
      });
      return res.status(202).json({ message: "Conversation got deleted!!" });
    } catch (error) {
      return res.status(500).json({
        message: "Something went wrong while deleting the converstion !!",
      });
    }
  },
  async oneDeleteConverstaion(req, res) {
    try {
      const exist = await Conversations.findOne({
        members: { $all: [req.user._id, req.body.reciverId] },
      });
      if (!exist) {
        return res.status(200).json({ message: "No converstaion found !!" });
      }
      try {
        const deleteMsg = await Messages.deleteMany({
          conversationId: exist._id.toString(),
        });
      } catch (error) {
        //console.log("no msg found");
      }
      const delConvo = await exist.deleteOne();
      console.log(delConvo);
      return res.status(200).json("Conversation got deleted!!");
    } catch (error) {
      return res.status(500).json({
        message: "Something went wrong while deleting user converstion !!",
      });
    }
  },
  async getOneConverstaion(req, res) {
    try {
      const exist = await Conversations.findOne({
        members: { $all: [req.user._id, req.params.id] },
      });
      if (!exist) {
        return res.status(404).json({ message: "No converstaion found !!" });
      }
      return res.status(200).json(exist);
    } catch (error) {
      return res.status(500).json({
        message: "Something went wrong while fetching converstion !!",
      });
    }
  },
};

export default conversationController;
