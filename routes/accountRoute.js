const express = require("express")
const router = express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const regValidate = require("../utilities/account-validation")
const { body } = require("express-validator")

// Login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Login POST
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Register view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Register POST
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Account management (requires login)
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement)
)

// Account update view
router.get("/update", utilities.checkLogin, accountController.buildAccountUpdate)
router.get("/update/:account_id", utilities.checkLogin, accountController.buildAccountUpdate)

// Account update POST
router.post(
  "/update",
  [
    body("account_firstname").trim().notEmpty().withMessage("First name is required."),
    body("account_lastname").trim().notEmpty().withMessage("Last name is required."),
    body("account_email").trim().isEmail().withMessage("Valid email required."),
  ],
  utilities.checkLogin,
  accountController.updateAccount
)

// Password update POST
router.post(
  "/update-password",
  [
    body("account_password")
      .trim()
      .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{12,}$/)
      .withMessage(
        "Password must be 12+ chars, 1 uppercase, 1 number, 1 special char."
      ),
  ],
  utilities.checkLogin,
  accountController.updatePassword
)

// Logout
router.get("/logout", accountController.logout)

module.exports = router