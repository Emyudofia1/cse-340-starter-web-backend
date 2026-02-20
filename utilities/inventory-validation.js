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

validate.inventoryRules = () => {
  return [

    body("inv_make").trim().notEmpty().withMessage("Make is required"),

    body("inv_model").trim().notEmpty().withMessage("Model is required"),

    body("inv_year")
      .isInt({ min: 1900 })
      .withMessage("Valid year required"),

    body("inv_price")
      .isFloat({ min: 0 })
      .withMessage("Valid price required"),

    body("inv_miles")
      .isFloat({ min: 0 })
      .withMessage("Valid miles required"),

    body("inv_color")
      .trim()
      .notEmpty()
      .withMessage("Color required"),

    body("classification_id")
      .notEmpty()
      .withMessage("Classification required"),
  ]
}

validate.checkUpdateData = async (req, res, next) => {

  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body

  const errors = validationResult(req)

  if (!errors.isEmpty()) {

    let nav = await utilities.getNav()

    let classificationSelect =
      await utilities.buildClassificationList(classification_id)

    return res.render("inventory/edit-inventory", {
      title: "Edit " + inv_make + " " + inv_model,
      nav,
      classificationSelect,
      errors,
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
    })
  }

  next()
}


validate.checkInventoryData = async (req, res, next) => {

  const errors = validationResult(req)

  if (!errors.isEmpty()) {

    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList(
      req.body.classification_id
    )

    return res.render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      classificationList,
      errors,
      formData: req.body,
    })
  }

  next()
}



module.exports = validate

