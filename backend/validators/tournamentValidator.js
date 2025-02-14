import Joi from "joi";

export const tournamentValidator = Joi.object({
  // Required fields
  sender: Joi.string().required(),
  name: Joi.string()
    .pattern(/^[a-zA-Z0-9_\-. ]+$/)
    .min(3)
    .max(16)
    .required(),
  instructions: Joi.string().min(100).max(10000).required(),
  initial_pool_size: Joi.number().min(0.5).max(10000).required().positive(),
  fee_multiplier: Joi.number().min(1).max(5).required().positive(),
  developer_fee: Joi.number().min(20).max(50).required().positive(),
  winner_payout_pct: Joi.number().min(50).max(80).required().positive(),
  feeType: Joi.number().min(0).max(1).required(),
  opening_message: Joi.string().min(10).max(130).default(""),
  pfp: Joi.alternatives().try(Joi.string().uri(), Joi.binary()).required(),

  // Tournament specific fields
  tournament_type: Joi.string().required(),
  phrases: Joi.array().items(Joi.string().min(4).max(255)).required(),

  // Tools configuration
  tools: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().allow(""),
        instruction: Joi.string().allow(""),
        description: Joi.string().allow(""),
      })
    )
    .default([]),
  tools_description: Joi.string().allow(""),
  tool_choice_required: Joi.boolean().default(false),

  // Optional fields with defaults
  success_function: Joi.string().allow("").default(null),
  disable: Joi.array().items(Joi.string().allow("")).default([]),
  characterLimit: Joi.number().default(500),
  contextLimit: Joi.number().default(1),
  charactersPerWord: Joi.number().allow(null).default(null),

  // Tournament settings
  constant_message_price: Joi.boolean().required(),
  expiry: Joi.date().required(),
  start_date: Joi.date().required(),

  // Metadata
  title: Joi.string().required().min(3).max(30),
  tldr: Joi.string().required().allow(null),

  useDefaultRules: Joi.boolean().allow(null),
  use_alcatraz: Joi.boolean().allow(null),
});
