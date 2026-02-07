const sequelize = require("../config/database");
const User = require("../models/User");

async function migrate() {
  try {
    // Sync database (create tables)
    await sequelize.sync({ force: false });
    console.log("✅ Database synchronized successfully");

    // Create default admin if not exists
    const adminExists = await User.findOne({ where: { role: "admin" } });

    if (!adminExists) {
      await User.create({
        username: "admin",
        email: "admin@example.com",
        password: "admin123",
        role: "admin",
      });
      console.log("✅ Default admin user created");
      console.log("   Username: admin");
      console.log("   Password: admin123");
    }

    // Create default user if not exists
    const userExists = await User.findOne({ where: { username: "user" } });

    if (!userExists) {
      await User.create({
        username: "user",
        email: "user@example.com",
        password: "user123",
        role: "user",
      });
      console.log("✅ Default user created");
      console.log("   Username: user");
      console.log("   Password: user123");
    }

    console.log("✅ Migration completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
