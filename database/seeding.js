const fs = require("fs");
const faker = require("faker");
const csvWriter = require("csv-write-stream");
const writer = csvWriter();
const pg = require("pg");
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/sdc", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;

const mongoBookSchema = new mongoose.Schema({
  book_id: { type: String, unique: true },
  book_title: String,
  price: Number,
});

const mongoReviewSchema = new mongoose.Schema({
  review_id: { type: String },
  review_text: String,
  rating: Number,
  book_id: String,
});

const Book = mongoose.model("Book", mongoBookSchema);
const Review = mongoose.model("Review", mongoReviewSchema);

module.exports.seedMongoBooks = () => {
  console.log(" -- mongo seeding started -- ");
  let increment = 500000;
  let start = 0;
  let end = 500000;

  const createMongoBooks = async (start, end) => {
    if (end <= 10000000) {
      for (var j = start; j < end; j++) {
        const newBook = new Book({
          book_id: j,
          book_title: faker.lorem.words(),
          price: faker.datatype.float({
            min: 1000,
            max: 9999,
          }),
        });
        const saved = await newBook.save();
      }
      start = end + 1;
      end = end + increment;
      createMongoBooks(start, end);
    } else {
      return;
    }
  };

  createMongoBooks(start, end);
  console.log(" -- mongo seeding ended -- ");
};

module.exports.seedMongoReviews = async () => {
  let reviewId = 0;
  let bookStart = 9500000;
  let bookEnd = 10000000;

  console.log(" -- mongo reviews started -- ");
  let reviews = [];

  for (let i = bookStart; i < bookEnd; i++) {
    let numberOfReviews = Math.floor(Math.random() * 10) + 1;

    for (let r = 0; r < numberOfReviews; r++) {
      let review = {
        insertOne: {
          review_id: reviewId,
          review_text: faker.lorem.paragraph(),
          rating: faker.datatype.number({
            min: 1,
            max: 5,
          }),
          book_id: i,
        },
      };
      reviews.push(review);
      reviewId++;
    }
  }

  const bulk = await Review.collection.bulkWrite(reviews);

  console.log(" -- mongo reviews added -- ");
  connection.close;
};

///// POSTGRES //////
const postgres = new pg.Client("postgresql://carsonweinand@localhost:5432/sdc");
postgres.connect((err) => {
  if (err) {
    console.error("pg connection error", err.stack);
  } else {
    console.log("pg connected");
  }
});

module.exports.seedPostgresBooks = () => {
  console.log(" -- postgres books csv writeStream started -- ");

  const createCsvFile = async () => {
    writer.pipe(fs.createWriteStream("./reviews/postgres-books-seed.csv"));

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
    console.log(" -- postgres books csv writeStream done -- ");
  };

  createCsvFile()
    .then(async () => {
      console.log(" -- postgres books seeding query started -- ");

      const seeded = await postgres.query(
        "COPY postgresseed (book_id, book_title, price) FROM '/Users/carsonweinand/Desktop/Hack_Reactor/SDC/price-service/postgres-books-seed.csv' WITH (FORMAT CSV, HEADER true, DELIMITER ',');"
      );

      console.log(" -- postgres books seeding query end -- ");
    })
    .catch((err) => {
      console.log("seeding failed", err);
    });
};

module.exports.seedPostgresReviews = () => {
  let reviewId = 49561006;
  let bookStart = 9000000;
  let bookEnd = 10000000;

  const createCsvFile = async () => {
    console.log(`-- postgres reviews csv writeStream started -- `);

    writer.pipe(fs.createWriteStream(`postgres-reviews-seed-11.csv`));

    for (var i = bookStart; i < bookEnd; i++) {
      let numberOfReviews = Math.floor(Math.random() * 10) + 1;

      for (var r = 0; r < numberOfReviews; r++) {
        console.log("reviewId", reviewId);
        writer.write({
          review_id: reviewId++,
          review_text: faker.lorem.paragraph(),
          rating: faker.datatype.number({
            min: 1,
            max: 5,
          }),
          book_id: i,
        });
      }
    }

    writer.end();
    console.log(" -- postgres reviews csv writeStream end -- ");
  };

  createCsvFile().then(async () => {
    console.log(" -- postgres reviews seeding query started -- ");

    const seeded = await postgres.query(
      `COPY postgresseedreviews (review_id, review_text, rating, book_id) FROM '/Users/carsonweinand/Desktop/Hack_Reactor/SDC/price-service/postgres-reviews-seed-11.csv' WITH (FORMAT CSV, HEADER true, DELIMITER ',');`
    );

    await postgres.end();
    console.log(" -- postgres reviews seeding query end -- ");
  });
};

require("make-runnable");

// <----- failed recursive reviews script ---->
// module.exports.seedPostgresReviews = () => {
//   let fileNum = 1;
//   let reviewId = 0;
//   let increment = 20;
//   let bookStart = 0;
//   let bookEnd = 20;

//   const createCsvFile = async (fileNum, bookStart, bookEnd) => {
//     console.log(`-- postgres reviews csv writeStream #${fileNum} started -- `);

//     if (fileNum <= 5) {
//       writer.pipe(fs.createWriteStream(`postgres-reviews-seed${fileNum}.csv`));

//       const csvwrite = () => {
//         for (var i = bookStart; i < bookEnd; i++) {
//           let numberOfReviews = Math.floor(Math.random() * 10) + 1;

//           for (var r = 0; r < numberOfReviews; r++) {
//             console.log("reviewId", reviewId);
//             writer.write({
//               review_id: reviewId++,
//               review_text: faker.lorem.paragraph(),
//               rating: faker.datatype.number({
//                 min: 1,
//                 max: 5,
//               }),
//               book_id: i,
//             });
//           }
//         }
//       };

//       const csv = await csvwrite();
//       // writer.end();

//       fileNum++;
//       bookStart = bookEnd;
//       bookEnd += increment;
//       console.log("fileNum, bookStart, bookEnd", fileNum, bookStart, bookEnd);
//       console.log(
//         ` -- postgres reviews csv writeStream #${fileNum - 1} end -- `
//       );

//       createCsvFile(fileNum, bookStart, bookEnd);
//     } else {
//       writer.end();
//       console.log(` -- postgres reviews csv writeStream complete -- `);
//     }
//   };
// createCsvFile().then(async (result) => {
//   console.log(" -- postgres reviews seeding query started -- ");

//   // for (var file = 1; file < 6; file++) {
//   //   const seeded = await postgres.query(
//   //     `COPY postgresseedreviews (review_id, review_text, rating, book_id) FROM '/Users/carsonweinand/Desktop/Hack_Reactor/SDC/price-service/database/reviews/postgres-reviews-seed${file}.csv' WITH (FORMAT CSV, HEADER true, DELIMITER ',');`
//   //   );
//   // }

//   console.log(" -- postgres reviews seeding query end -- ");
// });
// };
