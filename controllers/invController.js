const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const { body, validationResult } = require("express-validator")

const invCont = {}

/* ***************************
 * Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    const nav = await utilities.getNav()
    const className = data[0].classification_name

    res.render("./inventory/classification", {
      title: `${className} vehicles`,
      nav,
      grid,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 * Build vehicle detail view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  try {
    const inv_id = req.params.invId
    const vehicle = await invModel.getInventoryById(inv_id)
    const nav = await utilities.getNav()
    const vehicleHTML = utilities.buildVehicleDetail(vehicle)

    res.render("inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicleHTML,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 * Build Inventory Management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 * Build Add Classification Form
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
      classification_name: "", // sticky input
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 * Handle Add Classification POST
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  const nav = await utilities.getNav()
  const { classification_name } = req.body

  try {
    const result = await invModel.addClassification(classification_name)

    if (result.rowCount > 0) {
      req.flash("notice", "Classification added successfully.")
      return res.redirect("/inv/")
    } else {
      req.flash("notice", "Failed to add classification.")
      return res.render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: null,
        classification_name,
      })
    }

  } catch (error) {
    next(error)
  }
}


/* ***************************
 * Build Add Vehicle Form
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList()
    res.render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      classificationList,
      errors: null,
      formData: {}, // sticky input
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 * Handle Add Vehicle POST
 * ************************** */
invCont.addInventory = async function (req, res, next) {

  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList(
    req.body.classification_id
  )

  try {

    if (!req.body.inv_image)
      req.body.inv_image = "/images/vehicles/no-image.png"

    if (!req.body.inv_thumbnail)
      req.body.inv_thumbnail = "/images/vehicles/no-image-tn.png"

    const result = await invModel.addInventoryItem(req.body)

    if (result.rowCount > 0) {
      req.flash("notice", "Vehicle added successfully.")
      return res.redirect("/inv/")
    } else {

      req.flash("notice", "Failed to add vehicle.")

      return res.render("inventory/add-inventory", {
        title: "Add Vehicle",
        nav,
        classificationList,
        errors: null,
        formData: req.body,
      })
    }

  } catch (error) {
    next(error)
  }
}


module.exports = invCont
