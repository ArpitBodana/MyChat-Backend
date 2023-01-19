import { LoginSchemaValidator, UserSchemaValidator } from "../validators";
import bcrypt from "bcrypt";
import { Conversations, Messages, Users } from "../models";
import { JwtServices } from "../services";

const userController = {
  async registerUser(req, res) {
    const { error } = UserSchemaValidator.validate(req.body);
    if (error) {
      return res.status(500).json({ message: error.message });
    }
    try {
      const exist = await Users.exists({ email: req.body.email });
      const unique = await Users.exists({ name: req.body.name });
      if (exist) {
        return res
          .status(500)
          .json({ message: "Email is already registerd!!" });
      }
      if (unique) {
        return res.status(500).json({
          message: "Username is already taken!!",
        });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
    const hashedpassword = await bcrypt.hash(req.body.password, 10);
    const { name, email, password } = req.body;
    const user = new Users({
      name,
      email,
      password: hashedpassword,
      ...(req.body.profileImageUrl && {
        profileImageUrl: req.body.profileImageUrl,
      }),
    });
    try {
      const result = await user.save();
    } catch (err) {
      return res.status(500).json({ message: error.message });
    }

    res.json({ message: "user registered !!" });
  },
  async getAllUsers(req, res) {
    let allUsers;
    try {
      allUsers = await Users.find().select("-password");
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
    return res.json({ allUsers });
  },

  async signIn(req, res) {
    const { error } = LoginSchemaValidator.validate(req.body);
    if (error) {
      return res.status(500).json({ message: error.message });
    }
    try {
      const user = await Users.findOne({ email: req.body.email });
      if (!user) {
        return res.status(500).json({ message: "Wrong Credentials!!" });
      }
      const { _id, email, name, isActive, isAdmin } = user;
      const match = await bcrypt.compare(req.body.password, user.password);
      if (!match) {
        return res.status(500).json({ message: "Wrong Credentials!!" });
      }
      const access_token = JwtServices.sign({
        _id: user._id,
        name: user.name,
        isActive: user.isActive,
        isAdmin: user.isAdmin,
      });
      res.json({ _id, name, email, isActive, isAdmin, access_token });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
  async updateUser(req, res) {
    const user = await Users.findOne({ _id: req.user._id });
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.profileImageUrl = req.body.profileImageUrl || user.profileImageUrl;
      user.coverImageUrl = req.body.coverImageUrl || user.coverImageUrl;
      user.desc = req.body.desc || user.desc;
      user.city = req.body.city || user.city;
      user.country = req.body.country || user.country;

      if (req.body.password) {
        const match = await bcrypt.compare(req.body.oldpassword, user.password);
        if (!match) {
          return res.status(500).json({ message: "Wrong Credentials!!" });
        }
        const hashedpassword = await bcrypt.hash(req.body.password, 10);
        user.password = hashedpassword;
      }

      const updateUser = await user.save();
      const access_token = JwtServices.sign({
        _id: updateUser._id,
        isAdmin: updateUser.isAdmin,
      });
      return res.json({
        _id: updateUser._id,
        name: updateUser.name,
        email: updateUser.email,
        isAdmin: updateUser.isAdmin,
        desc: updateUser.desc,
        city: updateUser.city,
        country: updateUser.country,
        profileImageUrl: updateUser.profileImageUrl,
        coverImageUrl: updateUser.coverImageUrl,
        access_token,
      });
    } else {
      return res.status(401).json({ message: "User Not Found!!" });
    }
  },
  async deleteUser(req, res) {
    let user;
    try {
      user = await Users.findOne({ _id: req.user._id });
      if (!user) {
        return res.status(500).json({ message: "No User Found!!" });
      }
      const match = await bcrypt.compare(req.body.oldpassword, user.password);
      if (!match) {
        return res.status(500).json({ message: "Wrong Credentials!!" });
      }
      const convos = await Conversations.find({
        members: { $in: [req.user._id] },
      });
      try {
        convos.map(async (item) => {
          try {
            const deleteMsg = await Messages.deleteMany({
              conversationId: item._id.toString(),
            });
            const dum = await Conversations.deleteOne({
              _id: item._id.toString(),
            });
          } catch (error) {
            //console.log("no msg found");
          }
        });
      } catch (error) {}

      user.deleteOne();
      res.json({ message: `${user.name} is deleted` });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "something went wrong while deleting account!!" });
    }
  },
  async searchUser(req, res) {
    const userId = req.query.userId;
    const userName = req.query.userName;
    let user;
    try {
      user = userId
        ? await Users.findById({ _id: userId }).select(
            "-updatedAt -__v -password"
          )
        : await Users.find({ name: { $regex: userName } }).select(
            "-updatedAt -__v -password"
          );

      if (!user) {
        return res.status(500).json({ message: "No User Found!!" });
      }
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Something went wrong while searching.." });
    }
    res.json(user);
  },

  async followUser(req, res) {
    const { id } = req.params;
    if (id !== req.user._id) {
      try {
        const user = await Users.findById(id);
        const currentUser = await Users.findById(req.user._id);
        if (!user.followers.includes(req.user._id)) {
          if (!user.requests.includes(req.user._id)) {
            await user.updateOne({ $push: { requests: req.user._id } });
          }
          await user.updateOne({ $push: { followers: req.user._id } });
          await currentUser.updateOne({ $push: { followings: id } });
          return res.status(200).json({ message: "User has been followed !!" });
        } else {
          return res.status(500).json({
            message: "Already  following this user!!",
          });
        }
      } catch (error) {
        console.log(error);
        return res.status(500).json({
          message: "Something went wrong while following this user!!",
        });
      }
    } else {
      return res
        .status(403)
        .json({ message: "You can't follow yourserlf !!!" });
    }
  },
  async unfollowUser(req, res) {
    const { id } = req.params;
    if (id !== req.user._id) {
      try {
        const user = await Users.findById(id);
        const currentUser = await Users.findById(req.user._id);
        if (user.followers.includes(req.user._id)) {
          await user.updateOne({ $pull: { followers: req.user._id } });
          await currentUser.updateOne({ $pull: { followings: id } });
          if (user.requests.includes(req.user._id)) {
            await user.updateOne({ $pull: { requests: req.user._id } });
          }
          return res
            .status(200)
            .json({ message: "User has been unfollowed !!" });
        } else {
          return res.status(500).json({
            message: "You are not following this user!!",
          });
        }
      } catch (error) {
        console.log(error);
        return res.status(500).json({
          message: "Something went wrong while unfollowing this user!!",
        });
      }
    } else {
      return res
        .status(403)
        .json({ message: "You can't unfollow yourserlf !!!" });
    }
  },
  async acceptRequest(req, res) {
    const { id } = req.body;
    const userId = req.user._id;
    try {
      const userData = await Users.findById(userId);
      const friendData = await Users.findById(id);
      if (!userData.followings.includes(id)) {
        await userData.updateOne({ $push: { followings: id } });
        await friendData.updateOne({ $push: { followers: userId } });
      }
      await userData.updateOne({ $pull: { requests: id } });
      return res
        .status(200)
        .json({ message: "Request accepted and following back !!" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: " Unable to accept this request !!!" });
    }
  },
  
  async rejectRequest(req, res) {
    const { id } = req.body;
    const userId = req.user._id;
    try {
      const userData = await Users.findById(userId);
      await userData.updateOne({ $pull: { requests: id } });
      return res.status(200).json({ message: "Request rejected !!" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: " Unable to reject  this request !!!" });
    }
  },
};

export default userController;
