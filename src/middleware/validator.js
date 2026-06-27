const validator = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', messages: errors } });
  }
  next();
};

module.exports = validator;
