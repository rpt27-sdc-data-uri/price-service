const fs = require("fs");
const faker = require("faker");
const csvWriter = require("csv-write-stream");
const writer = csvWriter();
const pg = require("pg");

const currentDirectory = process.cwd();

module.exports.variables = {
  reviewId: 1,
  bookStart: 9900001,
  bookEnd: 10000000,
  csvNum: 1,
};

///// POSTGRES //////
const postgres = new pg.Client({
  user: process.env.PSQL_USER,
  host: '127.0.0.1',
  database: 'sdc',
  password: process.env.PSQL_PW,
});

postgres.connect((err) => {
  if (err) {
    console.error("pg connection error", err.stack);
  } else {
    console.log("pg connected");
  }
});

module.exports.seedPostgresBooks = () => {
  console.log(" -- postgres books create csv started -- ");

  const createCsvFile = () => {
    writer.pipe(fs.createWriteStream(`./books.csv`));

    for (var i = 9100000; i <= 10000000; i++) {
      console.log("id", i);
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
    console.log(" -- postgres books create csv done -- ");
  };

  return new Promise((resolve, reject) => {
    resolve(createCsvFile());
  })
      .then(() => {
     console.log("csv file creation complete");
  })
//    .then(() => {
//      return this.seedPostgresSaveCSV("books", "books");
//    })
//    .then((value) => {
//      console.log(" -- postgres save csv query query end --", value);
//    })
    .catch((error) => { 
      console.log("database seeding", error);
    });
};

module.exports.seedPostgresSaveCSV = async (table, csvFile) => {

  if (table === "books") {
    console.log(` -- postgres save books csv started -- file:${currentDirectory}/${csvFile}.csv`);

  try { 
    const booksTable = await postgres.query(
      `COPY ${table} (book_id, book_title, price) FROM '${currentDirectory}/${csvFile}.csv' WITH (FORMAT CSV, HEADER true, DELIMITER ',');`
     );

	return booksTable;
   } catch (err) { console.log("books copy query try/catch error"); }
  } else if (table === "reviews") {
    try {
      console.log(" -- postgres save reviews csv started -- ");

      const reviewsTable = await postgres.query(
        `COPY ${table} (review_id, review_text, rating, book_id) FROM '${currentDirectory}/${csvFile}.csv' WITH (FORMAT CSV, HEADER true, DELIMITER ',');`
     );
     return reviewsTable;
    } catch (error) {
      console.log("reviews save err", error);
    }
  }
};

module.exports.seedPostgresReviews = () => {
  console.log(`-- postgres reviews csv writeStream started -- `);

  return new Promise((resolve, reject) => {
    resolve(this.createReviewsCsvFile());
  })

//    .then(() => {
//      console.log(`reviews ${this.variables.csvNum} resolved`);
//      this.seedPostgresSaveCSV("reviews", `reviews${this.variables.csvNum}`);
//    })
    .catch((err) => {
      console.log("reviews err", err);
    });
};

module.exports.createReviewsCsvFile = () => {
  writer.pipe(fs.createWriteStream(`./reviews${this.variables.csvNum}.csv`));

  for (var i = this.variables.bookStart; i < this.variables.bookEnd; i++) {
    let numberOfReviews = Math.floor(Math.random() * 10) + 1;

    for (var r = 0; r < numberOfReviews; r++) {
      console.log("reviewId", this.variables.reviewId);
      writer.write({
        review_id: this.variables.reviewId++,
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

require("make-runnable");

// <-------! Mongo seeding code !------->
// const mongoose = require("mongoose");

// mongoose.connect("mongodb://localhost/sdc", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// const connection = mongoose.connection;

// const mongoBookSchema = new mongoose.Schema({
//   book_id: { type: String, unique: true },
//   book_title: String,
//   price: Number,
// });

// const mongoReviewSchema = new mongoose.Schema({
//   review_id: { type: String },
//   review_text: String,
//   rating: Number,
//   book_id: String,
// });

// const Book = mongoose.model("Book", mongoBookSchema);
// const Review = mongoose.model("Review", mongoReviewSchema);

// module.exports.seedMongoBooks = () => {
//   console.log(" -- mongo seeding started -- ");
//   let increment = 500000;
//   let start = 0;
//   let end = 500000;

//   const createMongoBooks = async (start, end) => {
//     if (end <= 10000000) {
//       for (var j = start; j < end; j++) {
//         const newBook = new Book({
//           book_id: j,
//           book_title: faker.lorem.words(),
//           price: faker.datatype.float({
//             min: 1000,
//             max: 9999,
//           }),
//         });
//         const saved = await newBook.save();
//       }
//       start = end + 1;
//       end = end + increment;
//       createMongoBooks(start, end);
//     } else {
//       return;
//     }
//   };

//   createMongoBooks(start, end);
//   console.log(" -- mongo seeding ended -- ");
// };

// module.exports.seedMongoReviews = async () => {
//   let reviewId = 0;
//   let bookStart = 9500000;
//   let bookEnd = 10000000;

//   console.log(" -- mongo reviews started -- ");
//   let reviews = [];

//   for (let i = bookStart; i < bookEnd; i++) {
//     let numberOfReviews = Math.floor(Math.random() * 10) + 1;

//     for (let r = 0; r < numberOfReviews; r++) {
//       let review = {
//         insertOne: {
//           review_id: reviewId,
//           review_text: faker.lorem.paragraph(),
//           rating: faker.datatype.number({
//             min: 1,
//             max: 5,
//           }),
//           book_id: i,
//         },
//       };
//       reviews.push(review);
//       reviewId++;
//     }
//   }

//   const bulk = await Review.collection.bulkWrite(reviews);

//   console.log(" -- mongo reviews added -- ");
//   connection.close;
// };

// <-----! failed recursive reviews script !---->
// module.exports.seedPostgresReviews = () => {
//   let fileNum = 1;
//   let reviewId = 0;
//   let increment = 2000000;
//   let bookStart = 0;
//   let bookEnd = 2000000;

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
//       writer.end();

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
//   createCsvFile().then(async (result) => {
//     console.log(" -- postgres reviews seeding query started -- ");

//     for (var file = 1; file < 6; file++) {
//       const seeded = await postgres.query(
//         `COPY postgresseedreviews (review_id, review_text, rating, book_id) FROM '/Users/carsonweinand/Desktop/Hack_Reactor/SDC/price-service/database/reviews/postgres-reviews-seed${file}.csv' WITH (FORMAT CSV, HEADER true, DELIMITER ',');`
//       );
//     }

//     console.log(" -- postgres reviews seeding query end -- ");
//   });
// };
