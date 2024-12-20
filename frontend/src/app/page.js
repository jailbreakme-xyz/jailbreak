"use client";
import React, { useEffect, useState } from "react";
import "../styles/Beta.css";
import axios from "axios";
import Header from "./components/templates/Header";
import AgentCard from "./components/templates/AgentCard";
import Hero from "./components/templates/Hero";
import PageLoader from "./components/templates/PageLoader";
import Jdenticon from "react-jdenticon";
import CountUp from "react-countup";
import Footer from "./components/templates/Footer";
import { ImCross } from "react-icons/im";
export default function Beta() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const getContent = async (initial) => {
    if (initial) {
      setLoading(true);
    }
    const data = await axios
      .get(`/api/settings`)
      .then((res) => res.data)
      .catch((err) => err);
    setData(data);
    setLoading(false);
  };

  useEffect(() => {
    getContent(true);
    const interval = setInterval(() => getContent(false), 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fullWidthPage">
      <div>
        <Header activeChallenge={data?.activeChallenge} />
        {loading ? (
          <PageLoader />
        ) : (
          <div className="beta-container">
            <Hero data={data} />
            <div className="beta-agents">
              <h1>Meet the Agents 🤖</h1>
              <hr />
              <div className="beta-agents-list">
                {data?.challenges?.map((agent, index) => (
                  <AgentCard char={agent} data={data} key={index} />
                ))}
              </div>
            </div>
            <div className="beta-breakers">
              <h1>Top Jailbreakers 🔥</h1>
              <hr />
              <div className="beta-breakers-list">
                {data?.topBreakers
                  ?.concat(data?.topChatters)
                  ?.map((breaker, index) => (
                    <div
                      className="beta-breaker pointer"
                      key={index}
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = `/breaker/${breaker?.address}`;
                      }}
                    >
                      <div
                        className="pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = `/breaker/${breaker?.address}`;
                        }}
                      >
                        <Jdenticon value={breaker?.address} size={"30"} />
                        <p className="beta-breaker-address pointer">
                          {breaker?.address?.slice(0, 4)}...
                          {breaker?.address?.slice(-4)}
                        </p>
                      </div>
                      <div className="beta-breaker-separator"></div>
                      <div>
                        {breaker?.totalUsdPrize > 0 ? (
                          <CountUp
                            end={breaker?.totalUsdPrize?.toFixed(0)}
                            prefix="$"
                            start={0}
                            duration={2.75}
                            decimals={0}
                            decimal="."
                          />
                        ) : (
                          <ImCross size={16} color="#ff0000" />
                        )}
                        <p>
                          {breaker?.winCount > 1
                            ? `${breaker?.winCount} WINS`
                            : breaker?.winCount === 1
                            ? `${breaker?.winCount} WIN`
                            : "NO WINS"}
                        </p>
                        <p>{breaker?.chatCount} BREAK ATTEMPTS</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <Footer />
          </div>
        )}
      </div>
    </div>
  );
}
