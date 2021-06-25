import React from "react";

import Membership from "./components/Membership.jsx";
import PriceButton from "./components/PriceButton.jsx";

class App extends React.Component {
  constructor(props) {
    super();
    this.state = {
      currentBook: {},
    };
  }

  generateRandomBookByIdOrTitle() {
    const params = document.location.search.substr(1);
    if (params.includes("bookId") || params.includes("bookTitle")) {
      return;
    } else {
      const randomBookId = Math.floor(Math.random() * 100);
      const paramToSet = `bookId=${randomBookId}`;
      let newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${paramToSet}`;
      window.history.pushState({ path: newUrl }, "", newUrl);
    }
  }

  getPrice() {
    let params = document.location.search.substr(1).split("&");

    // split up parameters into tuples with [key, value] schema
    params.forEach((item, i) => {
      params[i] = item.split("=");
    });

    // loop through parameters individually
    for (let param of params) {
      if (param[0] === "bookId" || param[0] === "bookTitle") {
        fetch(`http://localhost:3000/api/price/${param[1]}`)
          .then((response) => response.json())
          .then((data) => {
            console.log("== book data ==>", data);
            this.setState({
              currentBook: data,
            });
          })
          .catch((err) => {
            console.error(
              `Failed to fetch price data for bookId ${param[1]}`,
              err
            );
          });
      }
    }
  }

  componentDidMount() {
    this.generateRandomBookByIdOrTitle();
    this.getPrice();
  }

  render() {
    return (
      <div id="app">
        <Membership />
        <PriceButton price={this.state.currentBook.price} />
      </div>
    );
  }
}

export default App;
