import React, { useEffect, useState } from "react";
import "./styles/Beta.css";
import axios from "axios";
import Header from "./components/templates/Header";
import AgentCard from "./components/templates/AgentCard";
import Hero from "./components/templates/Hero";
import PageLoader from "./components/templates/PageLoader";
import Jdenticon from "react-jdenticon";
import CountUp from "react-countup";
import Footer from "./components/templates/Footer";
import { ImCross } from "react-icons/im";
import { Link } from "react-router-dom";
import AgentsCarousel from "./components/AgentsCarousel";
import ChallengesSection from "./components/templates/ChallengesSection";
import TrendingAgentsCarousel from "./components/templates/TrendingAgentsCarousel";

const numbersWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quickCreationOpen, setQuickCreationOpen] = useState(false);
  const [trendingAgents, setTrendingAgents] = useState(null);
  const [latestChallenges, setLatestChallenges] = useState(null);
  const [challenges, setChallenges] = useState(null);

  const handleQuickCreationOpen = () => {
    setQuickCreationOpen(true);
  };

  const handleQuickCreationClose = () => {
    setQuickCreationOpen(false);
  };

  const getContent = async (initial) => {
    if (initial) {
      setLoading(true);
    }
    const newData = await axios
      .get(`/api/settings`)
      .then((res) => res.data)
      .catch((err) => err);

    const newTrendingAgentsStr = JSON.stringify(newData?.trendingAgents);
    const currentTrendingAgentsStr = JSON.stringify(trendingAgents);
    const newLatestChallengesStr = JSON.stringify(newData?.latestChallenges);
    const currentLatestChallengesStr = JSON.stringify(latestChallenges);
    const newChallengesStr = JSON.stringify(newData?.challenges);
    const currentChallengesStr = JSON.stringify(challenges);
    const newDataStr = JSON.stringify(newData);
    const currentDataStr = JSON.stringify(data);

    if (newTrendingAgentsStr !== currentTrendingAgentsStr || initial) {
      setTrendingAgents(newData?.trendingAgents);
    }
    if (newLatestChallengesStr !== currentLatestChallengesStr || initial) {
      setLatestChallenges(newData?.latestChallenges);
    }
    if (newChallengesStr !== currentChallengesStr || initial) {
      setChallenges(newData?.challenges);
    }
    if (newDataStr !== currentDataStr || initial) {
      setData(newData);
    }

    // setTrendingAgents(newData?.trendingAgents);
    // setLatestChallenges(newData?.latestChallenges);
    // setChallenges(newData?.challenges);
    // setData(newData);

    if (initial) {
      setLoading(false);
    }
  };

  useEffect(() => {
    getContent(true);
    const interval = setInterval(() => getContent(false), 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fullWidthPage">
      <div>
        <Header
          handleQuickCreationOpen={handleQuickCreationOpen}
          handleQuickCreationClose={handleQuickCreationClose}
          quickCreationOpen={quickCreationOpen}
        />
        {loading ? (
          <PageLoader />
        ) : (
          <div className="beta-container">
            <Hero
              data={data}
              handleQuickCreationOpen={handleQuickCreationOpen}
              handleQuickCreationClose={handleQuickCreationClose}
              quickCreationOpen={quickCreationOpen}
            />

            <ChallengesSection
              latestChallenges={latestChallenges}
              challenges={challenges}
            />

            <TrendingAgentsCarousel agents={trendingAgents} />

            {/* <div className="beta-agents">
              <h1>Meet the Agents 🤖</h1>
              <hr />
              <div className="beta-agents-list">
                {data?.challenges?.map((agent, index) => (
                  <AgentCard char={agent} data={data} key={index} />
                ))}
              </div>
            </div> */}

            <div className="beta-breakers">
              <div className="beta-breakers-header">
                <div>
                  <h2 style={{ margin: "5px 0px" }}>🔥 Top Jailbreakers</h2>
                  <Link
                    className="pointer"
                    to="/breakers"
                    style={{
                      margin: "5px 0px",
                      fontSize: "14px",
                      color: "#666",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      transition: "color 0.2s ease",
                      fontWeight: "500",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#0BBF99")
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
                  >
                    View Leaderboard{" "}
                    <span style={{ marginLeft: "4px" }}>→</span>
                  </Link>
                </div>
                <div className="beta-counters inline-counters desktop">
                  <div>
                    <h4>🎯 BREAK ATTEMPTS</h4>
                    <CountUp
                      start={100}
                      end={data?.breakAttempts}
                      duration={2.75}
                      decimals={0}
                      decimal="."
                    />
                  </div>
                </div>
              </div>

              <hr />
              <div className="beta-breakers-list">
                {data?.topChatters?.map((breaker, index) => (
                  <div
                    className="beta-breaker pointer"
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = `/breaker/${breaker?.address}`;
                    }}
                  >
                    {index < 3 && (
                      <div className={`position-badge position-${index + 1}`}>
                        {index === 0 ? "👑" : index === 1 ? "🥈" : "🥉"}
                      </div>
                    )}
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
