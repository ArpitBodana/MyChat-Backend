import Joi from "joi";

const UserSchemaValidator = Joi.object({
  name: Joi.string().min(3).max(40).required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-z0-p]{3,30}$")).required(),
  repeat_password: Joi.ref("password"),
  profileImageUrl: Joi.string(),
  isActive: Joi.boolean(),
  isAdmin: Joi.boolean(),
});

export default UserSchemaValidator;
