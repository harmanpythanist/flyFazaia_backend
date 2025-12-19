const joi=require("joi");





const sign_validate=joi.object({id: joi.string()
  .required()
  .messages({
    "string.base": "User ID must be a string.",
    "string.empty": "User ID is required.",
    "string.pattern.base": "User ID must contain only digits.",
    "any.required": "User ID is required.",
  })
,
contact:joi.string()
  .pattern(/^(?:\+?\d{10,15}|03\d{9})$/)
  .required()
  .messages({
    "string.pattern.base": "Enter a valid phone number (local or international).",
  }),
  course: joi.string()
  .min(3)
  .max(50)
  .pattern(/^[A-Za-z0-9\s&\-.]+$/)
  .required()
  .messages({
    "string.base": "Course name must be a string.",
    "string.empty": "Course name cannot be empty.",
    "string.min": "Course name must be at least 3 characters long.",
    "string.max": "Course name cannot exceed 50 characters.",
    "any.required": "Course name is required.",
  })
});

const servcesForm_validate=joi.object({

  id:joi.string()
  .required().messages({
    "string.base": "User ID must be a string.",
    "string.empty": "User ID is required.",
    "string.pattern.base": "User ID must contain only digits.",
    "any.required": "User ID is required.",
  }),
  title:joi.string().pattern(/^(?!.*(<\s*\/?\s*script\b|on\w+\s*=|javascript:|<[^>]+>)).*$/is)
    .max(100)
    .required()
    .messages({
      "string.pattern.base": "HTML or script content is not allowed.",
      "string.empty": "Message cannot be empty.",
    }),
  contact:joi.string().pattern(/^(?:\+?\d{10,15}|03\d{9})$/)
  .required()
  .messages({
    "string.pattern.base": "Enter a valid phone number (local or international).",
  }),
  project:joi.string()
    .pattern(/^(?!.*(<\s*\/?\s*script\b|on\w+\s*=|javascript:|<[^>]+>)).*$/is)
    .max(5000)
    .required()
    .messages({
      "string.pattern.base": "HTML or script content is not allowed.",
      "string.empty": "Message cannot be empty.",
    })

});


    module.exports={sign_validate,servcesForm_validate};
