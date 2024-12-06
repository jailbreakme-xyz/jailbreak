import React from "react";
import "../../../styles/Carousel.css";

const Card = ({ char }) => {
  return (
    <div className={`challengeCard active`}>
      <img
        className="pointer"
        onClick={() => {
          window.open(`/agent/${char.name}`, "_blank");
        }}
        src={char.image}
        alt={char.name}
      />
      <div className="challenge-card-info">
        <h2
          className="pointer"
          onClick={() => {
            window.open(`/agent/${char.name}`, "_blank");
          }}
        >
          {char.name}
        </h2>
        <span>PRIZE POOL: {(char.entryFee * 100).toFixed(4)} SOL</span>
        <hr />
        <p>{char.label}</p>
        <p className={`level ${char.level}`}>{char.level}</p>
        <button
          className="pointer"
          onClick={() => window.open(`/break/${char.name}`, "_blank")}
        >
          Break {char.name} →
        </button>
      </div>
    </div>
  );
};

export default Card;
