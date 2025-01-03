import React, { useState } from "react";

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
    const total = characters?.length;
    return [
      characters[(currentIndex - 2 + total) % total],
      characters[(currentIndex - 1 + total) % total],
      characters[currentIndex],
      characters[(currentIndex + 1) % total],
      characters[(currentIndex + 2) % total],
    ];
  };

  const displayedCharacters = getDisplayedCharacters();

  return (
    <div className="carousel-container">
      <button className="carousel-btn left" onClick={prevSlide}>
        {"<"}
      </button>
      <div className="carousel">
        {displayedCharacters.map((char, index) => (
          <div
            key={index}
            className={`carousel-card ${
              index === 2 ? "active" : index === 1 || index === 3 ? "side" : ""
            }`}
          >
            <img src={char.image} alt={char.name} />
            {index === 2 && (
              <div className="card-info">
                <h2>{char.name}</h2>
                <p>{char.label}</p>
                <p className={`${char.level} level`}>{char.level}</p>
                <button>Break {char.name} →</button>
              </div>
            )}
          </div>
        ))}
      </div>
      <button className="carousel-btn right" onClick={nextSlide}>
        {">"}
      </button>
    </div>
  );
};

export default Carousel;
