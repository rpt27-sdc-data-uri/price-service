const newrelic = require("newrelic");
// initialize and export connection to mysql database
const { Sequelize } = require("sequelize");
// const mysql = require("mysql2/promise");
const pg = require("pg");
const methods = require("./methods/price.js");
require("dotenv").config();

let Models = {};

const init = async () => {
  // ------>>> establish Mysql connection to localhost
  // const connection = await mysql.createConnection({
  //   host: "localhost",
  //   password: process.env.DB_PASS,
  //   user: process.env.DB_USER,
  // });

  // ------>>> establish Mysql connection to EC2
  // const connection = await mysql.createConnection({
  //   host: 'ec2-34-221-235-141.us-west-2.compute.amazonaws.com',
  //   password: process.env.DB_PASS,
  //   user: process.env.DB_USER
  // });

  // ----->>> establish Psql connection to localhost
  // const sequelize = new Sequelize(
  //   "postgresql://carsonweinand@localhost:5432/sdc",
  //   { logging: false }
  // );

  const sequelize = new Sequelize(
    "sdc",
    process.env.PSQL_USER,
    process.env.PSQL_PW,
    {
      host: "localhost",
      dialect: "postgres",
      logging: false,
    }
  );

  try {
    await sequelize.authenticate();
    console.log("Postgres connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }

  // ----->>> create starting mysql database
  // await connection.query("CREATE DATABASE IF NOT EXISTS `audible_price`;");

  // const sequelize = new Sequelize('audible_price', 'root', null, {
  //   dialect: 'mysql',
  //   logging: false
  // });

  // create Mysql Sequelize connection
  // const sequelize = new Sequelize(
  //   "audible_price",
  //   process.env.DB_USER,
  //   process.env.DB_PASS,
  //   {
  //     dialect: "mysql",
  //     logging: false,
  //   }
  // );

  // db.sequelize = sequelize;

  Models.Price = require("./Models/Price.js")(sequelize);
  Models.Reviews = require("./Models/Reviews.js")(sequelize);

  // await sequelize.sync();

  // methods.init(sequelize, db.Price);
};

init();
module.exports = Models;
