// utilities/index.js

const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()


const utilities = {}

/* ***************************
 * Get navigation menu HTML
 * ************************** */
utilities.getNav = async function () {
  const classificationsData = await invModel.getClassifications()
  let nav = "<ul>"
  classificationsData.rows.forEach((row) => {
    nav += `<li><a href="/inv/classification/${row.classification_id}">${row.classification_name}</a></li>`
  })
  nav += "</ul>"
  return nav
}

/* ***************************
 * Build classification list HTML for forms
 * selectedId: optional default selected
 * ************************** */
utilities.buildClassificationList = async function (selectedId = null) {
  const classificationsData = await invModel.getClassifications()
  // let list = '<select name="classification_id" id="classification_id" required>'
  let list = '<select name="classification_id" id="classificationList" required>'

  list += '<option value="">Choose a Classification</option>'
  classificationsData.rows.forEach((row) => {
    const selected = row.classification_id == selectedId ? "selected" : ""
    list += `<option value="${row.classification_id}" ${selected}>${row.classification_name}</option>`
  })
  list += "</select>"
  return list
}

/* ***************************
 * Build inventory grid HTML
 * gridData: array of vehicles
 * ************************** */
utilities.buildClassificationGrid = async function (gridData) {
  if (!gridData || gridData.length === 0) {
    return "<p class='notice'>No vehicles could be found.</p>"
  }
  let grid = "<ul>"
  gridData.forEach((item) => {
    grid += `
      <li>
        <a href="/inv/detail/${item.inv_id}">
          <img src="${item.inv_thumbnail}" alt="Image of ${item.inv_make} ${item.inv_model}">
          <h2>${item.inv_make} ${item.inv_model}</h2>
          <span>$${item.inv_price}</span>
        </a>
      </li>
    `
  })
  grid += "</ul>"
  return grid
}

/* ***************************
 * Build vehicle detail HTML
 * vehicle: single vehicle object
 * ************************** */
utilities.buildVehicleDetail = function (vehicle) {
  if (!vehicle) return "<p class='notice'>Vehicle not found.</p>"
  return `
    <div class="vehicle-detail">
      <h2>${vehicle.inv_make} ${vehicle.inv_model}</h2>
      <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
      <p>Year: ${vehicle.inv_year}</p>
      <p>Mileage: ${vehicle.inv_miles}</p>
      <p>Price: $${vehicle.inv_price}</p>
      <p>Color: ${vehicle.inv_color}</p>
      <p>Description: ${vehicle.inv_description}</p>
    </div>
  `
}

/* ***************************
 * Async error handler wrapper
 * Wraps async route functions
 * ************************** */
utilities.handleErrors = function (fn) {
  return async function (req, res, next) {
    try {
      await fn(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}


/* ****************************************
* Middleware to check token validity
**************************************** */
utilities.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("notice", "Please log in")
          res.clearCookie("jwt")
          res.locals.loggedin = 0
          res.locals.accountData = null
          return res.redirect("/account/login")
        }
        res.locals.accountData = accountData
        res.locals.loggedin = 1
        next()
      }
    )
  } else {
    // Reset flags if no JWT is present
    res.locals.loggedin = 0
    res.locals.accountData = null
    next()
  }
}


/* ****************************************
 *  Check Login
 * ************************************ */
// utilities.checkLogin = (req, res, next) => {
//   if (res.locals.loggedin) {
//     next()
//   } else {
//     req.flash("notice", "Please log in.")
//     return res.redirect("/account/login")
//   }
// }

utilities.checkLogin = (req, res, next) => {
  if (req.cookies.jwt) {
    next();
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
};

module.exports = utilities
