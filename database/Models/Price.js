// model + methods for interacting with Price
const { DataTypes } = require("sequelize");

// ============ MODEL ==============
module.exports = (sequelize) => {
  return sequelize.define(
    "Price",
    {
      book_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      book_title: {
        type: DataTypes.STRING,
      },
      price: {
        type: DataTypes.FLOAT,
      },
    },
    {
      timestamps: false,
    }
  );
};
