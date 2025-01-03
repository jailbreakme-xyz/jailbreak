import React from "react";

const ScoreCircle = ({ score }) => {
  // Determine border color based on score
  const getBorderColor = (score) => {
    if (score <= 30) return "red";
    if (score <= 60) return "orange";
    if (score <= 80) return "yellow";
    return "green";
  };

  const circleStyle = {
    width: "55px",
    height: "55px",
    borderRadius: "50%",
    border: `2px solid ${getBorderColor(score)}`,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "14px",
    fontWeight: "bold",
    margin: "5px auto 0px",
    color: getBorderColor(score),
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "10px",
        right: "20px",
        textAlign: "center",
        color: getBorderColor(score),
      }}
    >
      <span style={{ fontSize: "12px", fontWeight: "bold" }}>
        HIGHEST SCORE
      </span>
      <div style={circleStyle}>{score}</div>
    </div>
  );
};

export default ScoreCircle;
