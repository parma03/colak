const User = require("../models/User");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");

// Render halaman login
exports.getLogin = (req, res) => {
  if (req.cookies.accessToken) {
    return res.redirect("/dashboard");
  }
  res.render("auth/login", { error: null });
};

// Render halaman register
exports.getRegister = (req, res) => {
  if (req.cookies.accessToken) {
    return res.redirect("/dashboard");
  }
  res.render("auth/register", { error: null });
};

// Proses login
exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.render("auth/login", {
        error: "Email dan password harus diisi",
      });
    }

    // Cari user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.render("auth/login", { error: "Email atau password salah" });
    }

    // Verifikasi password
    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
      return res.render("auth/login", { error: "Email atau password salah" });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Simpan refresh token ke database
    await user.update({ refreshToken });

    // Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000, // 15 menit
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
    });

    res.redirect("/dashboard");
  } catch (error) {
    console.error("Login error:", error);
    res.render("auth/login", { error: "Terjadi kesalahan saat login" });
  }
};

// Proses register
exports.postRegister = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Validasi input
    if (!username || !email || !password || !confirmPassword) {
      return res.render("auth/register", { error: "Semua field harus diisi" });
    }

    if (password !== confirmPassword) {
      return res.render("auth/register", { error: "Password tidak cocok" });
    }

    if (password.length < 6) {
      return res.render("auth/register", {
        error: "Password minimal 6 karakter",
      });
    }

    // Cek apakah user sudah ada
    const existingUser = await User.findOne({
      where: {
        [require("sequelize").Op.or]: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.render("auth/register", {
        error: "Username atau email sudah terdaftar",
      });
    }

    // Create user baru
    await User.create({
      username,
      email,
      password,
      role: "user",
    });

    res.redirect("/login?registered=true");
  } catch (error) {
    console.error("Register error:", error);
    res.render("auth/register", { error: "Terjadi kesalahan saat registrasi" });
  }
};

// Refresh token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token tidak ditemukan" });
    }

    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const user = await User.findByPk(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(user);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
    });

    res.json({ message: "Token refreshed successfully" });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ message: "Terjadi kesalahan" });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      const decoded = verifyRefreshToken(refreshToken);
      if (decoded) {
        await User.update(
          { refreshToken: null },
          { where: { id: decoded.id } },
        );
      }
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.redirect("/login");
  } catch (error) {
    console.error("Logout error:", error);
    res.redirect("/login");
  }
};
