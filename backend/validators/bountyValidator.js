import Joi from "joi";

const bountySchema = Joi.object({
  name: Joi.string().min(2).max(16).required().messages({
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name cannot exceed 16 characters",
    "string.empty": "Name is required",
  }),

  targetUrl: Joi.string().uri().required().messages({
    "string.uri": "Target URL must be a valid URL",
    "string.empty": "Target URL is required",
  }),

  prize: Joi.number().min(2).required().messages({
    "number.min": "Prize must be at least 2 SOL",
    "number.base": "Prize must be a number",
  }),

  task: Joi.string().min(6).max(100).required().messages({
    "string.min": "Task description must be at least 6 characters long",
    "string.max": "Task description cannot exceed 100 characters",
    "string.empty": "Task description is required",
  }),

  txn: Joi.string().allow(""),
});

export const validateBounty = (data) => {
  return bountySchema.validate(data, { abortEarly: false });
};
