// controllers/accountController.js
const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
require("dotenv").config()
const { validationResult } = require("express-validator")
const activityModel = require("../models/activity-model");

/* ****************************************
 * Build Login View
 **************************************** */
async function buildLogin(req, res) {
  const nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    messages: req.flash("notice") || [],
    errors: null,
    account_email: ""
  })
}

/* ****************************************
 * Process Login
 **************************************** */
async function accountLogin(req, res) {
  const { account_email, account_password } = req.body
  const nav = await utilities.getNav()

  if (!account_email || !account_password) {
    req.flash("notice", "Email and password are required.")
    return res.redirect("/account/login")
  }

  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Invalid credentials. Try again.")
    return res.redirect("/account/login")
  }

  try {
    const passwordMatch = await bcrypt.compare(account_password, accountData.account_password)
    if (!passwordMatch) {
      req.flash("notice", "Invalid credentials. Try again.")
      return res.redirect("/account/login")
    }

    delete accountData.account_password

    const token = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      maxAge: 3600000
    })
    await activityModel.logActivity(accountData.account_id, "Login");
    res.redirect("/account")
  } catch (error) {
    console.error("Login error:", error)
    req.flash("notice", "Error processing login. Please try again.")
    res.redirect("/account/login")
  }
}

/* ****************************************
 * Build Register View
 **************************************** */
async function buildRegister(req, res) {
  const nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register Account",
    nav,
    messages: req.flash("notice") || [],
    errors: null
  })
}

/* ****************************************
 * Process Registration
 **************************************** */
async function registerAccount(req, res) {
  const nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  if (!account_firstname || !account_lastname || !account_email || !account_password) {
    req.flash("notice", "All fields are required.")
    return res.redirect("/account/register")
  }

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10)
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )

    req.flash("notice", `Congrats ${account_firstname}, registration successful! Please log in.`)
    res.redirect("/account/login")
  } catch (error) {
    console.error("Registration error:", error)
    req.flash("notice", "Error registering account. Try again.")
    res.redirect("/account/register")
  }
}

/* ****************************************
 * Build Account Management
 **************************************** */
async function buildAccountManagement(req, res) {
  const nav = await utilities.getNav()
  res.render("account/index", {
    title: "Account Management",
    nav,
    firstName: res.locals.firstName,
    account_type: res.locals.accountType,
    account_id: res.locals.accountId,
    messages: { notice: req.flash("notice") || [] }
  })
}

/* ****************************************
 * Build Account Update View
 **************************************** */
async function buildAccountUpdate(req, res) {
  const nav = await utilities.getNav()
  const account_id = res.locals.accountId || req.params.account_id

  try {
    const accountData = await accountModel.getAccountById(account_id)
    if (!accountData) {
      req.flash("notice", "Account not found")
      return res.redirect("/account")
    }

    res.render("account/update", {
      title: "Update Account",
      nav,
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      messages: { notice: req.flash("notice") || [] },
      errors: null
    })
  } catch (error) {
    console.error(error)
    req.flash("notice", "Error loading account information")
    res.redirect("/account")
  }
}

/* ****************************************
 * Update Account Info
 **************************************** */
async function updateAccount(req, res) {
  const nav = await utilities.getNav()
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    await activityModel.logActivity(account_id, "Update Account");
    return res.render("account/update", {
      title: "Update Account",
      nav,
      messages: { notice: req.flash("notice") || [] },
      errors,
      account_id: req.body.account_id,
      account_firstname: req.body.account_firstname,
      account_lastname: req.body.account_lastname,
      account_email: req.body.account_email
    })
  }

  try {
    await accountModel.updateAccountById(
      req.body.account_id,
      req.body.account_firstname,
      req.body.account_lastname,
      req.body.account_email
    )
    req.flash("notice", "Account updated successfully!")
    res.redirect("/account")
  } catch (error) {
    console.error(error)
    req.flash("notice", "Error updating account. Try again.")
    res.redirect("/account/update")
  }
}

/* ****************************************
 * Update Password
 **************************************** */
async function updatePassword(req, res) {
  const nav = await utilities.getNav()
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.render("account/update", {
      title: "Change Password",
      nav,
      messages: { notice: req.flash("notice") || [] },
      errors,
      account_id: req.body.account_id
    })
  }

  try {
    const hashedPassword = await bcrypt.hash(req.body.account_password, 12)
    await accountModel.updatePasswordById(req.body.account_id, hashedPassword)
    req.flash("notice", "Password updated successfully!")
    res.redirect("/account")
  } catch (error) {
    console.error(error)
    req.flash("notice", "Error updating password. Try again.")
    res.redirect("/account/update")
  }
}

/* ****************************************
 * Logout
 **************************************** */
// function logout(req, res) {
//   res.clearCookie("jwt")
//   req.flash("notice", "Logged out successfully")
//   res.redirect("/")
// }

async function logout(req, res) {
  try {
    if (req.cookies.jwt) {
      // Clear JWT cookie
      res.clearCookie("jwt");
    }

    // Destroy session if it exists
    req.session.destroy(() => {
      res.redirect("/");
    });

  } catch (error) {
    console.error("Logout Error:", error);
    res.redirect("/");
  }
}

module.exports = {
  buildLogin,
  accountLogin,
  buildRegister,
  registerAccount,
  buildAccountManagement,
  buildAccountUpdate,
  updateAccount,
  updatePassword,
  logout
}