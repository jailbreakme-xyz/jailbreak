"use client";
import Image from "next/image";
import { FaClock, FaChartLine } from "react-icons/fa";
import CountUp from "react-countup";
import Timer from "../partials/Timer";

export default function ChatMenu({ challenge, attempts, price, usdPrice }) {
  return (
    <div className="chatMenu desktopChatMenu">
      {challenge?.title && (
        <div className="challengeTitle">
          <div
            style={{
              display: "inline-flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <div>
              <h2 style={{ margin: "0px 0px 5px" }}>{challenge?.title}</h2>
              <span
                className={`${challenge?.level} level`}
                style={{ fontWeight: "bold" }}
              >
                {challenge?.level}
              </span>
            </div>
            <div className="pointer">
              <Image
                onClick={() => {
                  window.open(`/agent/${challenge?.name}`, "_blank");
                }}
                alt="logo"
                src={challenge?.pfp}
                width="50"
                height="50"
                className="pfp pointer"
                style={{ border: "6px double #ebebeb" }}
              />
            </div>
          </div>
          <hr />
          <span>{challenge?.label}</span>
        </div>
      )}
      <div style={{ textAlign: "left" }} className="statsWrapper">
        <h3 style={{ fontSize: "22px", margin: "5px 0px" }}>
          <FaClock
            style={{
              position: "relative",
              top: "4px",
            }}
          />{" "}
          EXPIRY
        </h3>
        <hr />
        <div className="stats">
          <Timer expiryDate={challenge?.expiry} />
          <p
            style={{
              fontSize: "14px",
              color: "#ccc",
              lineHeight: "10px",
            }}
          >
            Last sender wins when the timer ends.
          </p>
          <p
            style={{
              fontSize: "14px",
              color: "#ccc",
              lineHeight: "1.2rem",
            }}
          >
            Each message rounds the timer up to 1 hour if less than 1 hour
            remains.
          </p>
        </div>
      </div>
      <div style={{ textAlign: "left" }} className="statsWrapper">
        <h3 style={{ fontSize: "22px", margin: "5px 0px" }}>
          <FaChartLine
            style={{
              position: "relative",
              top: "4px",
            }}
          />{" "}
          STATS
        </h3>
        <hr />
        <div className="stats">
          <div className="chatComingSoonMenuItem">
            <h4>Break Attempts</h4>
            <CountUp
              start={0}
              end={attempts}
              duration={2.75}
              decimals={0}
              decimal="."
            />
          </div>
          <div className="chatComingSoonMenuItem">
            <h4>Message Price</h4>
            <CountUp
              start={0}
              end={price}
              duration={2.75}
              decimals={3}
              decimal="."
              suffix=" SOL"
            />{" "}
            <span style={{ fontSize: "12px" }}>(${usdPrice?.toFixed(2)})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
