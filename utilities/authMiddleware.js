const jwt = require("jsonwebtoken");

function requireEmployeeOrAdmin(req, res, next) {
  const token = req.cookies.jwt;
  if (!token) {
    req.flash("error", "You must log in to access this page.");
    return res.redirect("/account/login");
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (payload.account_type === "Employee" || payload.account_type === "Admin") {
      next(); // authorized
    } else {
      req.flash("error", "You do not have permission to access this page.");
      return res.redirect("/account/login");
    }
  } catch (err) {
    req.flash("error", "Session expired. Please log in again.");
    return res.redirect("/account/login");
  }
}

module.exports = { requireEmployeeOrAdmin };
