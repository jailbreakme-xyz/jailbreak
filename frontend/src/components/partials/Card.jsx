import React from "react";
import Timer from "./Timer";
const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const Card = ({ char, data }) => {
  return (
    <div className={`challengeCard active`}>
      <img
        className="pointer"
        onClick={() => {
          window.open(`/agent/${char.name}`, "_blank");
        }}
        src={char.pfp}
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
        {data && (
          <strong style={{ color: "#0bbf99" }}>
            PRIZE POOL: $
            {numberWithCommas(
              (char.entryFee * char.fee_multiplier * data.solPrice).toFixed(2)
            )}
          </strong>
        )}
        <hr />
        <p>{char.label}</p>
        <p className={`level ${char.level}`}>{char.level}</p>
        {char.status === "upcoming" ? (
          <div className="upcoming-timer">
            <p
              style={{ fontSize: "14px", color: "#0bbf99", fontWeight: "bold" }}
            >
              Starts in
            </p>
            <Timer expiryDate={char.start_date} />
          </div>
        ) : (
          <button
            className="pointer"
            onClick={() => window.open(`/break/${char.name}`, "_blank")}
          >
            Break {char.name} →
          </button>
        )}
      </div>
    </div>
  );
};

export default Card;
