import React, { useEffect } from "react";
import { useTimer } from "react-timer-hook";

function Timer({ expiryDate }) {
  const { seconds, minutes, hours, restart } = useTimer({
    expiryTimestamp: new Date(expiryDate),
    onExpire: () => console.log("Timer expired!"),
  });

  useEffect(() => {
    restart(new Date(expiryDate));
  }, [expiryDate, restart]);

  return (
    <div>
      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "start",
          alignItems: "center",
          columnGap: "5px",
          fontWeight: "bold",
        }}
      >
        <div
          style={{
            backgroundColor: "#ccc",
            color: "black",
            padding: "10px",
            borderRadius: "10px",
            width: "25px",
            textAlign: "center",
          }}
        >
          <span>{hours < 10 ? `0${hours}` : hours}</span>
        </div>
        <span style={{ fontSize: "20px", fontWeight: "bold" }}>:</span>
        <div
          style={{
            backgroundColor: "#ccc",
            color: "black",
            padding: "10px",
            borderRadius: "10px",
            width: "25px",
            textAlign: "center",
          }}
        >
          <span>{minutes < 10 ? `0${minutes}` : minutes}</span>
        </div>
        <span style={{ fontSize: "20px", fontWeight: "bold" }}>:</span>
        <div
          style={{
            backgroundColor: "#ccc",
            color: "black",
            padding: "10px",
            borderRadius: "10px",
            width: "25px",
            textAlign: "center",
          }}
        >
          <span>{seconds < 10 ? `0${seconds}` : seconds}</span>
        </div>
      </div>
    </div>
  );
}

export default Timer;
