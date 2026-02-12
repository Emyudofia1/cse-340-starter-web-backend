const { body, validationResult } = require("express-validator")
const utilities = require(".")
const validate = {}

validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage("Classification name must not contain spaces or special characters.")
  ]
}

validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors,
      classification_name,
    })
    return
  }
  next()
}

module.exports = validate
