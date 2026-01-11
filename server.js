
/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
require("dotenv").config()
const app = express()
const staticRoutes = require("./routes/static")

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* ***********************
 * Routes
 *************************/
app.use(staticRoutes)

app.get("/", function (req, res) {
  res.render("index", { title: "Home" })
})

/* ***********************
 * Server
 *************************/
const port = process.env.PORT || 5500

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
