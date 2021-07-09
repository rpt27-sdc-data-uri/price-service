import React from "react";

const PriceButton = (props) => (
  <div id="price">
    <button className="priceButton" id="bookBuy">
      Buy for ${props.price ? props.price : ""}
    </button>
  </div>
);

export default PriceButton;
