exports.getDashboard = (req, res) => {
  res.render("dashboard/index", {
    user: req.user,
    pageTitle: "Dashboard",
  });
};
