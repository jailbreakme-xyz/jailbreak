import React, { useState } from "react";
import "../../../styles/Carousel.css";

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const Carousel = (props) => {
  const characters = props.challenges;
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % characters.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + characters.length) % characters.length
    );
  };

  const getDisplayedCharacters = () => {
    const total = characters.length;
    return [
      characters[(currentIndex - 1 + total) % total], // Previous
      characters[currentIndex], // Active
      characters[(currentIndex + 1) % total], // Next
    ];
  };

  const displayedCharacters = getDisplayedCharacters();

  return (
    <div className="carousel-container">
      <button className="carousel-btn left pointer" onClick={prevSlide}>
        {"<"}
      </button>
      <div className="carousel inactive">
        {displayedCharacters.map((char, index) => (
          <div
            key={index}
            className={`carousel-card ${
              index === 1
                ? "active"
                : index === 0
                ? "previous"
                : index === 2
                ? "next"
                : ""
            }`}
          >
            <img src={char.image} alt={char.name} />

            <div className="card-info">
              <h2>{char.name}</h2>
              <strong>
                PRIZE POOL RECORD: $
                {numberWithCommas(
                  (char.winning_prize * props.data.solPrice).toFixed(0)
                )}
              </strong>
              <hr style={{ width: "90%", borderStyle: "dashed" }} />
              <p>{char.label}</p>
              <p className={`level ${char.level}`}>{char.level}</p>
              {/* <button className="grayed" style={{ cursor: "not-allowed" }}>
                COMING SOON
              </button> */}
            </div>
          </div>
        ))}
      </div>
      <button className="carousel-btn right pointer" onClick={nextSlide}>
        {">"}
      </button>
    </div>
  );
};

export default Carousel;
