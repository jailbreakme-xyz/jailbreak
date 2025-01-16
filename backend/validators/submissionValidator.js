import Joi from "joi";

export const submissionSchema = Joi.object({
  name: Joi.string().min(3).required().messages({
    "string.min": "Name must be at least 3 characters long",
    "string.empty": "Name is required",
    "any.required": "Name is required",
  }),

  website: Joi.string().uri().required().messages({
    "string.uri": "Website must be a valid URL",
    "string.empty": "Website URL is required",
    "any.required": "Website URL is required",
  }),

  social: Joi.string().uri().required().messages({
    "string.uri": "Social account must be a valid URL",
    "string.empty": "Social account URL is required",
    "any.required": "Social account URL is required",
  }),

  description: Joi.string().min(10).required().messages({
    "string.min": "Description must be at least 10 characters long",
    "string.empty": "Description is required",
    "any.required": "Description is required",
  }),
}).options({ abortEarly: false });

export const validateSubmission = async (data) => {
  try {
    const value = await submissionSchema.validateAsync(data);
    return { value, error: null };
  } catch (error) {
    return {
      value: null,
      error: error.details.map((detail) => ({
        field: detail.path[0],
        message: detail.message,
      })),
    };
  }
};
