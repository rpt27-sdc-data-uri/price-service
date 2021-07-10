import React from "react";

const Reviews = (props) => {
  console.log("props", props);
  const reviewDetails = props.reviews.map((review) => (
    <div className="review" key={review.review_id}>
      <div className="review_text">{review.review_text}</div>
      <div className="rating">{review.rating}</div>
    </div>
  ));

  return (
    <div id="reviews-container">
      <div id="reviews">
        <div>{reviewDetails}</div>
      </div>
    </div>
  );
};

export default Reviews;
