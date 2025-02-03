import Joi from "joi";

const searchQueryValidator = Joi.object({
  cursor: Joi.string().base64(),
  challenge: Joi.string(),
  address: Joi.string(),
  content: Joi.string(),
  role: Joi.string().valid("user", "assistant"),
  start_date: Joi.date().iso(),
  end_date: Joi.date().iso().greater(Joi.ref("start_date")),
  sort_order: Joi.string().valid("asc", "desc").default("desc"),
  win: Joi.boolean(),
  limit: Joi.number().integer().min(1).max(100).default(100),
});

export const validateSearchQuery = (data) => {
  return searchQueryValidator.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};
