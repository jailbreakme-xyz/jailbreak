"use client";
import React from "react";
import Link from "next/link";
import { FaChevronCircleRight } from "react-icons/fa";
import AgentCard from "./AgentCard";
import Counters from "./Counters";
import Jdenticon from "react-jdenticon";
import CountUp from "react-countup";
import InlineCounters from "./InlineCounters";
const Hero = ({ data }) => {
  return (
    <div className="beta-content">
      <div className="beta-content-left">
        <h1>What is JailbreakMe?</h1>
        <hr style={{ width: "80%", margin: "0px" }} />
        <p>
          The first open-source decentralized app where organizations test their
          AI models and agents while users earn rewards for jailbreaking them.
        </p>
        <Counters data={data} />
        <InlineCounters data={data} />

        {/* <p style={{ fontWeight: "bold", fontStyle: "italic" }}>
          TOP WINNERS 🔥
        </p> */}
        <div
          id="heroTopWinners"
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "start",
            alignItems: "center",
            columnGap: "25px",
            padding: "0px 0px 0px",
            margin: "0px 0px",
          }}
        >
          {data?.topChatters &&
            data?.topChatters?.slice(0, 5)?.map((breaker, index) => (
              <div
                key={index}
                className="pointer"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = `/breaker/${breaker?.address}`;
                }}
                style={{
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Jdenticon value={breaker?.address} size={"50"} />
                <p
                  className="beta-breaker-address pointer"
                  style={{
                    backgroundColor: "#181726",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {index === 0 && "👑 "}
                  {breaker?.address?.slice(0, 3)}...
                  {breaker?.address?.slice(-3)}
                </p>
                <CountUp
                  end={breaker?.totalUsdPrize?.toFixed(0)}
                  prefix="$"
                  start={0}
                  duration={2.75}
                  decimals={0}
                  decimal="."
                />
              </div>
            ))}
        </div>
        <div className="hero-buttons">
          <Link
            href={`/break/${data?.activeChallenge?.name}`}
            target="_blank"
            className="pointer"
            style={{ zIndex: "99999", position: "relative" }}
          >
            <button className="styledBtn pointer">
              START BREAKING <FaChevronCircleRight className="pointer" />
            </button>
          </Link>

          <button className="styledBtn pointer disabled">
            LAUNCH TOURNAMENT 🔜
          </button>
        </div>

        {/* <h3 style={{ margin: "5px" }}>Top Winners 🔥</h3>
        <div
          id="heroTopWinners"
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "start",
            alignItems: "center",
            columnGap: "25px",
            padding: "20px 0px 0px",
          }}
        >
          {data?.topChatters &&
            data?.topChatters?.slice(0, 6)?.map((breaker, index) => (
              <div
                key={index}
                className="pointer"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = `/breaker/${breaker?.address}`;
                }}
                style={{
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Jdenticon value={breaker?.address} size={"40"} />
                <p className="beta-breaker-address pointer">
                  {breaker?.address?.slice(0, 2)}...
                  {breaker?.address?.slice(-2)}
                </p>
                <CountUp
                  end={breaker?.totalUsdPrize?.toFixed(0)}
                  prefix="$"
                  start={0}
                  duration={2.75}
                  decimals={0}
                  decimal="."
                />
              </div>
            ))}
        </div> */}
      </div>
      <div className="beta-content-right">
        {data?.activeChallenge && (
          <AgentCard char={data?.activeChallenge} data={data} hero={true} />
        )}
      </div>
    </div>
  );
};

export default Hero;
