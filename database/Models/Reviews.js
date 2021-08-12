const { DataTypes } = require("sequelize");
const Price = require("./Price.js");

module.exports = (sequelize) => {
  return sequelize.define(
    "Review",
    {
      review_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      review_text: {
        type: DataTypes.STRING(4000),
        allowNull: false,
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      book_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "books", // for ec2 = books
          key: "book_id",
        },
      },
    },
    {
      timestamps: false,
      tableName: "reviews", // for ec2 = reviews
    }
  );

  Price.hasMany(Review);
};
