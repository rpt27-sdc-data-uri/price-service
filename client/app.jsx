import React from "react";

import Membership from "./components/Membership.jsx";
import PriceButton from "./components/PriceButton.jsx";
import Reviews from "./components/Reviews.jsx";

class App extends React.Component {
  constructor(props) {
    super();
    this.state = {
      currentBook: {},
      reviews: [],
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

  getBook() {
    let params = document.location.search.substr(1).split("&");

    // split up parameters into tuples with [key, value] schema
    params.forEach((item, i) => {
      params[i] = item.split("=");
    });

    // loop through parameters individually
    for (let param of params) {
      if (param[0] === "bookId" || param[0] === "bookTitle") {
        fetch(`http://3.129.19.227:3001/api/price/${param[1]}`) // for ec2 = http://3.129.19.227:3001/api/price/${param[1]}
          .then((response) => response.json())
          .then((response) => {
            console.log("== book data ==>", response);
            this.setState({
              currentBook: response.book,
              reviews: response.reviews,
            });
          })
          .catch((err) => {
            console.error(
              `Failed to fetch price data for bookId ${param[1]}`,
              err
            );
            this.setState({
              currentBook: [],
            });
          });
      }
    }
  }

  componentDidMount() {
    this.generateRandomBookByIdOrTitle();
    this.getBook();
  }

  render() {
    return (
      <div id="app">
        <Membership />
        <PriceButton price={this.state.currentBook.price} />
        <Reviews
          reviews={this.state.reviews}
          title={this.state.currentBook.book_title}
        />
      </div>
    );
  }
}

export default App;
