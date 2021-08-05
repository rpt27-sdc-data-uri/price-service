// const newrelic = require("newrelic");

// express
const express = require("express");
const port = 3001;

// utils
const fs = require("fs");
const morgan = require("morgan");
const path = require("path");
const compression = require("compression");
const cors = require("cors");
const faker = require("faker");

// cache
const redis = require("redis");
const client = redis.createClient();

// clustering
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;
const process = require("process");

// trying to implement SSR
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const Models = require("../database/index.js");
const db = require("../database/methods/price.js");
const App = require("../client/app.jsx");

if (cluster.isMaster) {
  console.log(`Number of CPUs is ${numCPUs}`);
  console.log(`Master ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("online", function (worker) {
    console.log("Worker " + worker.process.pid + " is online");
  });

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    console.log("Let's fork another worker!");
    cluster.fork();
  });
} else {
  const app = express();
  app.use(cors());
  app.use(compression());
  app.use(express.static(path.join(__dirname, "..", "/public")));
  app.use(morgan("dev"));

  ///// DESERTED SSR CODE //////

  // app.use("*", (req, res) => {
  //   let indexHTML = fs.readFileSync(
  //     path.resolve(__dirname, "../public/index.html"),
  //     {
  //       encoding: "utf8",
  //     }
  //   );

  //   let appHTML = ReactDOMServer.renderToString(<App />);

  //   indexHTML = indexHTML.replace(
  //     '<div id="price-service"></div>',
  //     `<div id="price-service">${appHTML}</div>`
  //   );

  //   res.contentType("text/html");
  //   res.status(200);

  //   return res.send(indexHTML);
  // });

  ///// DESERTED SSR CODE //////

  // app.get("/", (req, res) => {
  //   const component = ReactDOMServer.renderToString(<App />);
  //   const html = `<!DOCTYPE html>
  //   <html>
  //     <head>
  //       <title>Audible-ssr</title>
  //       <style>
  //         body {
  //           background-color: darkblue;
  //         }
  //       </style>
  //       <!-- <link rel='stylesheet' href='styles.css'> -->
  //       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  //     <script defer src="priceBundle.js"></script></head>
  //     <body>
  //       <div id="price-service">${component}</div>
  //       <script src="priceBundle.js"></script>
  //     </body>
  //   </html>`;

  //   res.send(html);
  // });

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
        console.log("<= CACHE =>");
        res.status(200).json(resultJSON);
      } else {
        db.findBookId(Models.Price, Models.Reviews, bookId)
          .then((data) => {
            client.set(bookId, JSON.stringify(data), "EX", 60 * 60 * 24);
            console.log(".db.");
            res.json(data);
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
}

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
