const jwt = require("jsonwebtoken");

function addUserDataToLocals(req, res, next) {
  const token = req.cookies.jwt;

  if (token) {
    try {
      const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // ✅ FIXED

      res.locals.loggedIn = true;
      res.locals.accountType = payload.account_type;
      res.locals.firstName = payload.account_firstname; // see note below
      res.locals.accountId = payload.account_id;

    } catch (err) {
      res.locals.loggedIn = false;
    }
  } else {
    res.locals.loggedIn = false;
  }

  next();
}

module.exports = { addUserDataToLocals };

