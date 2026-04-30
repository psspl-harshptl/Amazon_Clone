require("dotenv").config();
const app = require("./app");
const sequelize = require("./config/database");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");
    
    // In production, we don't sync, we use migrations
    // if (process.env.NODE_ENV === 'development') {
    //   await sequelize.sync();
    // }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
};

startServer();
