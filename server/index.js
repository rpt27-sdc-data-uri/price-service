// const newrelic = require("newrelic");
const express = require("express");
const app = express();
const morgan = require("morgan");
const path = require("path");
const compression = require("compression");
const Models = require("../database/index.js");
const db = require("../database/methods/price.js");
const cors = require("cors");
const faker = require("faker");
const port = 3001;
const redis = require("redis");
const client = redis.createClient();

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
// app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.end();
});

client.on("error", function (error) {
  console.log("redis error", error);
});

// CREATE
app.post("/api/price/postNewBook", (req, res) => {
  db.createNewBook(Models.Price, Models.Reviews)
    .then((book) => {
      res.send(JSON.stringify(book.dataValues));
      console.log("app.post successful");
    })
    .catch((err) => {
      console.error(err);
      res.status(404).send("failed to create new book");
    });
});

// READ w bookId
app.get("/api/price/:bookId", (req, res) => {
  const bookId = req.params.bookId;

  client.get(bookId, (err, result) => {
    if (result) {
      const resultJSON = JSON.parse(result);
      console.log("====== CACHED ======");
      res.status(200).json(resultJSON);
    } else {
      db.findBookId(Models.Price, Models.Reviews, bookId)
        .then((data) => {
          client.set(bookId, JSON.stringify(data), "EX", 60 * 60 * 24);
          res.json(data);
          console.log("database");
        })
        .catch((err) => {
          console.error(err);
          res.status(404).send("failed to find resource");
        });
    }
  });
});

// UPDATE
app.put("/api/price/:bookId", (req, res) => {
  const bookId = req.params.bookId;

  db.updateBook(Models.Price, Models.Reviews, bookId)
    .then((numberUpdated) => {
      res.send(JSON.stringify(numberUpdated));
      console.log("app.put successful");
    })
    .catch((err) => {
      console.error(err);
      res.status(404).send("failed to update book");
    });
});

// DELETE
app.delete("/api/price/:bookId", (req, res) => {
  const bookId = req.params.bookId;

  db.deleteBook(Models.Price, Models.Reviews, bookId)
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
// app.get("/api/price/:bookTitle", (req, res) => {
//   const book = db
//     .findBookTitle(Price.Price, req.params.bookTitle)
//     .then((book) => {
//       res.send(JSON.stringify(book.dataValues));
//     })
//     .catch((err) => {
//       console.error(err);
//       res.status(404).send("failed to find resource");
//     });
// });

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server running on port:${port}.`);
  });
}

module.exports = app;
