const User = require("../models/User");
const { Op } = require("sequelize");

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "username", "email", "role", "createdAt"],
      order: [["createdAt", "DESC"]],
    });

    res.render("dashboard/users", {
      user: req.user,
      users,
      pageTitle: "User Management",
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).render("error", {
      message: "Terjadi kesalahan saat mengambil data user",
      user: req.user,
    });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validasi input
    if (!username || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Semua field harus diisi",
      });
    }

    // Validasi role
    if (!["admin", "user"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role tidak valid",
      });
    }

    // Validasi password minimal 6 karakter
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password minimal 6 karakter",
      });
    }

    // Cek apakah username atau email sudah ada
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username atau email sudah terdaftar",
      });
    }

    // Create user baru
    const newUser = await User.create({
      username,
      email,
      password,
      role,
    });

    res.json({
      success: true,
      message: "User berhasil ditambahkan",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menambahkan user",
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, role } = req.body;

    // Validasi role
    if (role && !["admin", "user"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role tidak valid",
      });
    }

    // Prevent admin from changing their own data
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Tidak dapat mengubah data akun sendiri",
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    // Cek apakah username atau email sudah digunakan user lain
    if (username || email) {
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [username ? { username } : {}, email ? { email } : {}],
          id: { [Op.ne]: id },
        },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username atau email sudah digunakan",
        });
      }
    }

    // Update data
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password minimal 6 karakter",
        });
      }
      updateData.password = password;
    }
    if (role) updateData.role = role;

    await user.update(updateData);

    res.json({
      success: true,
      message: "User berhasil diupdate",
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengupdate user",
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Tidak dapat menghapus akun sendiri",
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    await user.destroy();

    res.json({
      success: true,
      message: "User berhasil dihapus",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menghapus user",
    });
  }
};
