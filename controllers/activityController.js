const utilities = require("../utilities/");
const activityModel = require("../models/activity-model");

async function buildActivityPage(req, res) {
  const nav = await utilities.getNav();

  const account_id = res.locals.accountData.account_id;

  const activityLogs = await activityModel.getActivityByAccount(account_id);

  res.render("account/activity", {
    title: "My Activity Log",
    nav,
    activityLogs,
    messages: req.flash("notice") || [],
  });
}
module.exports = {
  buildActivityPage,
};