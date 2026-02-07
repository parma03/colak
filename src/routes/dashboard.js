const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const userController = require("../controllers/userController");
const { authMiddleware, isAdmin } = require("../middleware/auth");

// Dashboard route (accessible by all authenticated users)
router.get("/", authMiddleware, dashboardController.getDashboard);

// User management routes (admin only)
router.get("/users", authMiddleware, isAdmin, userController.getUsers);
router.post("/users", authMiddleware, isAdmin, userController.createUser);
router.put("/users/:id", authMiddleware, isAdmin, userController.updateUser);
router.delete("/users/:id", authMiddleware, isAdmin, userController.deleteUser);

module.exports = router;
