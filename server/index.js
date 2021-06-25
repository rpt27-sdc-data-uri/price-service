const express = require("express");
const morgan = require("morgan");
const path = require("path");
const compression = require("compression");
const Price = require("../database/index.js");
const db = require("../database/methods/price.js");
const app = express();
const cors = require("cors");
const port = 3000;
const faker = require("faker");

// const whiteList = [
//   "http://54.183.2.218",
//   "http://54.153.95.228",
//   "http://34.221.235.141",
//   "http://34.219.131.242",
//   "http://13.57.14.144",
//   "http://76.94.227.26",
//   "http://18.188.135.5",
//   "http://18.188.223.199",
//   "http://ec2-34-219-131-242.us-west-2.compute.amazonaws.com",
// ];
// const corsOpts = {
//   origin: (origin, cb) => {
//     if (whiteList.indexOf(origin) !== -1) {
//       cb(null, true);
//     } else {
//       cb(new Error("Not allowed by CORS"));
//     }
//   },
// };

app.use(cors());
app.use(compression());
app.use(express.static(path.join(__dirname, "..", "/public")));
app.use(morgan("dev"));

// app.get("/", (req, res) => {
//   res.end();
// });

// CREATE
app.post("/api/price/:bookId", (req, res) => {
  db.createNewBook(Price.Price)
    .then((book) => {
      res.send(JSON.stringify(book));
      console.log("app.post successful");
    })
    .catch((err) => {
      console.error(err);
      res.status(404).send("failed to create new book");
    });
});

// READ w bookId
app.get("/api/price/:bookId", (req, res) => {
  db.findBookId(Price.Price, req.params.bookId)
    .then((book) => {
      res.send(JSON.stringify(book.dataValues));
      console.log("app.get successful");
    })
    .catch((err) => {
      console.error(err);
      res.status(404).send("failed to find resource");
    });
});

// UPDATE
app.put("/api/price/:bookId", (req, res) => {
  let bookId = faker.datatype.number();

  db.updateBook(Price.Price, bookId)
    .then((book) => {
      res.send(JSON.stringify(book.dataValues));
      console.log("app.put successful");
    })
    .catch((err) => {
      console.error(err);
      res.status(404).send("failed to update book");
    });
});

// DELETE
app.delete("/api/price/:bookId", (req, res) => {
  let bookId = faker.datatype.number();

  deleteBook(Price.Price, bookId)
    .then((result) => {
      res.sendStatus(200);
      console.log("app.delete successful");
    })
    .catch((err) => {
      console.error(err);
      res.status(404).send("failed to delete book");
    });
});

// READ w book title
app.get("/api/price/:bookTitle", (req, res) => {
  const book = db
    .findBookTitle(Price.Price, req.params.bookTitle)
    .then((book) => {
      res.send(JSON.stringify(book.dataValues));
    })
    .catch((err) => {
      console.error(err);
      res.status(404).send("failed to find resource");
    });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server running on port:${port}.`);
  });
}

module.exports = app;
