import { JwtServices } from "../services";

const isAuth = async (req, res, next) => {
  let authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Invalid Token!!" });
  }
  const token = authHeader.split(" ")[1];

  try {
    const { _id, isAdmin } = await JwtServices.verifyToken(token);
    const user = {
      _id,
      isAdmin,
    };
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid Token!!" });
  }
};

export default isAuth;
