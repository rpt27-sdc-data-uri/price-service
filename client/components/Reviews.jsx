import React from "react";

const Reviews = (props) => {
  const reviewDetails = props.reviews.map((review) => (
    <div className="review" key={review.review_id}>
      <div className="review_text">{review.review_text}</div>
      <div className="rating">{review.rating} Stars</div>
    </div>
  ));

  return (
    <div className="reviews-container">
      <div className="reviews">
        <span id="reviews-title">Reviews</span>
        <div>{reviewDetails}</div>
      </div>
    </div>
  );
};

export default Reviews;
