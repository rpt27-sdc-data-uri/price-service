const fs = require("fs");
const faker = require("faker");
const csvWriter = require("csv-write-stream");
const writer = csvWriter();
const pg = require("pg");

const postgres = new pg.Client("postgresql://carsonweinand@localhost:5432/sdc");
postgres.connect((err) => {
  if (err) {
    console.error("pg connection error", err.stack);
  } else {
    console.log("pg connected");
  }
});

// module.exports.seedMongo = () => {
//   console.log(" -- mongo seeding started -- ");
// };

module.exports.seedPostgres = () => {
  console.log(" -- postgres csv writeStream started -- ");

  const createCsvFile = async () => {
    let id = 0;
    writer.pipe(fs.createWriteStream("postgres-seed.csv"));

    for (var i = 0; i < 10000000; i++) {
      writer.write({
        book_id: i,
        book_title: faker.lorem.words(),
        price: faker.datatype.float({
          min: 1000,
          max: 9999,
        }),
      });
    }

    writer.end();
    console.log(" -- postgres csv writeStream done -- ");
  };

  createCsvFile()
    .then(async () => {
      console.log(" -- postgres seeding query started -- ");

      await postgres.query(
        "COPY postgresseed (book_id, book_title, price) FROM '/Users/carsonweinand/Desktop/Hack_Reactor/SDC/price-service/postgres-seed.csv' WITH (FORMAT CSV, HEADER true, DELIMITER ',');"
      );

      console.log(" -- postgres seeding query end -- ");
    })
    .catch((err) => {
      console.log("seeding failed", err);
    });
};

require("make-runnable");
