import Joi from "joi";

// 🔹 Register validation
const validateRegister = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().trim().required(),

    email: Joi.string().email().lowercase().trim().required(),

    password: Joi.string().min(8).required(),

    role: Joi.string()
      .valid("buyer", "seller", "admin")
      .default("buyer"),

    avatar: Joi.string().allow("", null),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }

  next();
};

// 🔹 Login validation
const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email(),
    userName: Joi.string(),
    password: Joi.string().required(),
  }).or("email", "userName");

  const { error } =
    schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message:
        error.details[0].message,
    });
  }
  
  next();
};

export { validateRegister, validateLogin };