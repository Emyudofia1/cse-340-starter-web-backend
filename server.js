/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
require("dotenv").config()
const app = express()

const staticRoutes = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const utilities = require("./utilities")
const session = require("express-session")
const pool = require("./database/")
const accountRoute = require("./routes/accountRoute")
const flash = require("connect-flash")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const { addUserDataToLocals } = require("./utilities/accountUtils");

/* ***********************
 * Middleware
 * ************************/

// Body parser FIRST
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Cookie parser
app.use(cookieParser())

// Session middleware
app.use(session({
  store: new (require("connect-pg-simple")(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: "sessionId",
}))

// ------------------------
// Flash Messages Middleware
// ------------------------
// Flash Messages Middleware
app.use(flash())

app.use((req, res, next) => {
  res.locals.notice = req.flash("notice")
  next()
})



app.use(addUserDataToLocals);


// JWT check middleware
app.use(utilities.checkJWTToken)

/* ***********************
 * View Engine and Layout
 * ************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* ***********************
 * Routes
 * ************************/
app.use(staticRoutes)
app.use("/account", accountRoute)
app.use(express.static("public"))
app.use("/inv", inventoryRoute)

app.get("/", utilities.handleErrors(baseController.buildHome))

/* ***********************
 * Error Handler
 * ************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)

  const message =
    err.status == 404
      ? err.message
      : "Oh no! There was a crash. Maybe try a different route?"

  res.render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav,
  })
})

/* ***********************
 * Server
 * ************************/
const port = process.env.PORT || 5500

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
