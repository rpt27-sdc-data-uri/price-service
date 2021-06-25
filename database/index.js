// initialize and export connection to mysql database
const { Sequelize } = require("sequelize");
const mysql = require("mysql2/promise");
const methods = require("./methods/price.js");
require("dotenv").config();

let db = {};

const init = async () => {
  const connection = await mysql.createConnection({
    host: "localhost",
    password: process.env.DB_PASS,
    user: process.env.DB_USER,
  });

  // const connection = await mysql.createConnection({
  //   host: 'ec2-34-221-235-141.us-west-2.compute.amazonaws.com',
  //   password: process.env.DB_PASS,
  //   user: process.env.DB_USER
  // });

  await connection.query("CREATE DATABASE IF NOT EXISTS `audible_price`;");

  // const sequelize = new Sequelize('audible_price', 'root', null, {
  //   dialect: 'mysql',
  //   logging: false
  // });

  const sequelize = new Sequelize(
    "audible_price",
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      dialect: "mysql",
      logging: false,
    }
  );
  db.sequelize = sequelize;

  db.Price = require("./Models/Price.js")(sequelize);

  await sequelize.sync();

  methods.init(sequelize, db.Price);
};

init();
module.exports = db;
