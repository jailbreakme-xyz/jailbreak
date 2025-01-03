import React, { useEffect } from "react";
import { useTimer } from "react-timer-hook";

function Timer({ expiryDate }) {
  const { seconds, minutes, hours, days, restart } = useTimer({
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
          justifyContent: "flex-start",
          alignItems: "center",
          columnGap: "3px",
          fontWeight: "bold",
        }}
      >
        {days > 0 && (
          <div
            style={{
              backgroundColor: "black",
              color: "#09bf99",
              padding: "10px",
              borderRadius: "10px",
              textAlign: "center",
              width: "18px",
              fontSize: "14px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <span>{days < 10 ? `0${days}` : days}</span>
          </div>
        )}
        {days > 0 && (
          <span
            style={{ fontSize: "12px", fontWeight: "bold", color: "#09bf99" }}
          >
            :
          </span>
        )}

        <div
          style={{
            backgroundColor: "black",
            color: "#09bf99",
            padding: "10px",
            borderRadius: "10px",
            textAlign: "center",
            width: "18px",
            fontSize: "14px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <span>{hours < 10 ? `0${hours}` : hours}</span>
        </div>
        <span
          style={{ fontSize: "12px", fontWeight: "bold", color: "#09bf99" }}
        >
          :
        </span>
        <div
          style={{
            backgroundColor: "black",
            color: "#09bf99",
            padding: "10px",
            borderRadius: "10px",
            textAlign: "center",
            width: "18px",
            fontSize: "14px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <span>{minutes < 10 ? `0${minutes}` : minutes}</span>
        </div>
        <span
          style={{ fontSize: "12px", fontWeight: "bold", color: "#09bf99" }}
        >
          :
        </span>
        <div
          style={{
            backgroundColor: "black",
            color: "#09bf99",
            padding: "10px",
            borderRadius: "10px",
            textAlign: "center",
            width: "18px",
            fontSize: "14px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <span>{seconds < 10 ? `0${seconds}` : seconds}</span>
        </div>
      </div>
    </div>
  );
}

export default Timer;
