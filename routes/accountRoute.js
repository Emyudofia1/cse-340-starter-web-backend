const express = require("express")
const router = new express.Router()

const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const regValidate = require("../utilities/account-validation")


router.get(
  "/login",
  utilities.handleErrors(accountController.buildLogin)
)

/* ****************************************
 *  Deliver login view
 * *************************************** */
// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)


/* ****************************************
 *  Deliver registration view
 * *************************************** */
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
)


router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement)
)




/* ****************************************
 *  Process registration
 * *************************************** */
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)


module.exports = router
