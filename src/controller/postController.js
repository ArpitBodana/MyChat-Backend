import { Posts, Users } from "../models";

const postController = {
  async createPost(req, res) {
    const userId = req.user._id;
    const { desc } = req.body;
    const post = {
      userId,
      desc,
      ...(req.body.img && {
        img: req.img,
      }),
    };
    const newPost = new Posts(post);
    try {
      const savedPost = await newPost.save();
      return res.status(201).json(savedPost);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Something went wrong while creating your post!!" });
    }
  },
  async updatePost(req, res) {
    const { id } = req.params;
    try {
      const post = await Posts.findById(id);
      if (post.userId === req.user._id) {
        const updatedPost = await post.updateOne({ $set: req.body });
        return res.status(202).json({ message: "post has been updated!!" });
      } else {
        return res
          .status(500)
          .json({ message: "You can only change your posts !!" });
      }
    } catch (error) {
      return res.status(404).json({ message: "Unable to find post!!" });
    }
  },
  async deletePost(req, res) {
    const { id } = req.params;
    try {
      const post = await Posts.findById(id);
      if (post.userId === req.user._id) {
        await post.deleteOne();
        return res.status(202).json({ message: "post has been deleted!!" });
      } else {
        return res
          .status(500)
          .json({ message: "You can only delete your posts !!" });
      }
    } catch (error) {
      return res.status(404).json({ message: "Unable to find post!!" });
    }
  },
  async likePost(req, res) {
    const { id } = req.params;
    let post;
    try {
      post = await Posts.findById(id);
      if (!post.likes.includes(req.user._id)) {
        await post.updateOne({ $push: { likes: req.user._id } });
        return res.status(200).json({ message: "Post liked!!" });
      } else {
        await post.updateOne({ $pull: { likes: req.user._id } });
        return res.status(200).json({ message: "Post disliked!!" });
      }
    } catch (error) {
      return res.status(500).json({ message: "Post not Found!!" });
    }
  },
  async getPost(req, res) {
    const { id } = req.params;
    try {
      const post = await Posts.findById(id);
      return res.status(200).json(post);
    } catch (error) {
      return res.status(500).json({ message: "Post not Found!!" });
    }
  },
  async getTimeLinePosts(req, res) {
    try {
      const currentUser = await Users.findById(req.user._id);
      const userPosts = await Posts.find({ userId: currentUser._id });
      const friendsPosts = await Promise.all(
        currentUser.followings.map((friendId) => {
          return Posts.find({ userId: friendId });
        })
      );
      return res.status(200).json(userPosts.concat(...friendsPosts));
    } catch (error) {
      return res.status(500).json({
        message: "Something went wrong while loading your timeline!!",
      });
    }
  },
};

export default postController;
