/* eslint-disable */

"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import "./page.module.css";
import Header from "./components/Header";
import SocialIcons from "./components/partials/SocialIcons";
import { FaChevronCircleRight } from "react-icons/fa";
import APIDocumentation from "./components/APIDocumentation";
import HowItWorks from "./components/partials/HowItWorks";
import axios from "axios";
import Carousel from "./components/partials/Carousel";
import Card from "./components/partials/Card";
import BarLoader from "react-spinners/BarLoader";
import CountUp from "react-countup";
import {
  GiBreakingChain,
  GiPayMoney,
  GiOpenTreasureChest,
} from "react-icons/gi";

export default function Home() {
  const [data, setData] = useState(null);
  const [endpoints, setEndpoints] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [loading, setLoading] = useState(true);

  const getEndpoints = async () => {
    setLoading(true);
    const data = await axios
      .get(`/api/settings`)
      .then((res) => res.data)
      .catch((err) => err);
    setEndpoints(data.endpoints);
    setChallenges(data.challenges);
    setActiveChallenge(data.activeChallenge);
    setData(data);
    setLoading(false);
  };

  useEffect(() => {
    getEndpoints();
  }, []);

  const override = {
    display: "block",
    margin: "0 auto",
    width: "200px",
  };

  return !loading ? (
    <main className="main">
      <div className="homepage">
        <div className="hero">
          <div className="diagonal-top diagonal-top-1"></div>
          <div className="diagonal-top diagonal-top-2"></div>
          <div className="diagonal-top diagonal-top-3"></div>
          <div className="diagonal-top diagonal-top-4"></div>
          <Header activeChallenge={activeChallenge} />

          <div className="intro">
            <SocialIcons />
            <p>
              The first open-source decentralized app where organizations test
              their AI models and agents while users earn rewards for
              jailbreaking them.
            </p>
            <Link
              href={
                activeChallenge?.status === "active"
                  ? `/break/${activeChallenge?.name}`
                  : activeChallenge
                  ? `/agent/${activeChallenge?.name}`
                  : "/break/echo"
              }
              target="_blank"
              className="pointer"
              style={{ zIndex: "99999", position: "relative" }}
            >
              <button className="styledBtn stoneBtn pointer">
                START BREAKING <FaChevronCircleRight className="pointer" />
              </button>
            </Link>
            <div
              style={{
                marginTop: "10px",
                display: "flex",
                justifyContent: "center",
                alignContent: "center",
                columnGap: "10px",
                width: "70%",
                margin: "10px auto 0px",
              }}
              className="desktopOnly links"
            >
              <a
                className="pointer"
                href="https://jailbreak.gitbook.io/jailbreakme.xyz"
                target="_blank"
              >
                DOCS
              </a>
              <a className="pointer" href="/faq">
                FAQ
              </a>
              {activeChallenge?.name && (
                <a
                  className="pointer"
                  href={`/agent/${activeChallenge.name}`}
                  style={{ textTransform: "uppercase" }}
                >
                  {activeChallenge.name}
                </a>
              )}
              <a className="pointer" href="/jail-token">
                $JAIL
              </a>
            </div>
          </div>

          <HowItWorks />
        </div>
        <div className="section-3" id="section-3">
          <div className="diagonal-middle diagonal-middle-1"></div>
          <div className="diagonal-middle diagonal-middle-2"></div>
          <div className="diagonal-middle diagonal-middle-3"></div>
          <div className="diagonal-middle diagonal-middle-4"></div>
          <div className="activeSection">
            <div
              className="counters"
              style={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div>
                <GiBreakingChain size={44} />
                <h4>
                  TOTAL
                  <br />
                  BREAK ATTEMPTS
                </h4>
                <hr />
                <CountUp
                  start={0}
                  end={data?.breakAttempts}
                  duration={2.75}
                  decimals={0}
                  decimal="."
                />
              </div>
              <div>
                <GiOpenTreasureChest size={44} />
                <h4>
                  TOTAL
                  <br />
                  TREASURY
                </h4>
                <hr />
                <CountUp
                  start={0}
                  end={data?.treasury}
                  duration={2.75}
                  decimals={0}
                  decimal="."
                  prefix="$"
                />
              </div>
              <div>
                <GiPayMoney size={44} />
                <h4>
                  TOTAL
                  <br />
                  PAYOUT
                </h4>
                <hr />
                <CountUp
                  start={0}
                  end={data?.total_payout}
                  duration={2.75}
                  decimals={0}
                  decimal="."
                  prefix="$"
                />
              </div>
            </div>
            {activeChallenge && (
              <div>
                <div className="section-3-title">
                  {activeChallenge?.status === "upcoming" ? (
                    <h1 style={{ textTransform: "uppercase" }}>
                      Upcoming Tournament
                    </h1>
                  ) : (
                    <h1 style={{ textTransform: "uppercase" }}>
                      Active Tournament
                    </h1>
                  )}
                </div>
                <div className="activeChallenges">
                  {activeChallenge && (
                    <Card char={activeChallenge} data={data} />
                  )}
                  <button
                    id="comingSoonButton"
                    className="styledBtn grayed disabled"
                    style={{
                      border: "0px",
                      borderRadius: "5px",
                      display: "grid",
                      margin: "5px auto",
                    }}
                  >
                    <span>
                      Create Tournament{" "}
                      <FaChevronCircleRight className="disabled" />
                    </span>
                    <span>(Coming Soon)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="section-3-title">
            <h1 style={{ textTransform: "uppercase" }}>
              Concluded Tournaments ↓
            </h1>
            {!activeChallenge && (
              <span>We are working on the next tournament, stay tuned.</span>
            )}
          </div>
          <div className="sliderWrapper">
            {challenges?.length > 0 && (
              <Carousel
                challenges={challenges.filter((s) => s.status === "concluded")}
                data={data}
              />
            )}
          </div>
          <div className="diagonal-middle-bottom diagonal-middle-bottom-1"></div>
          <div className="diagonal-middle-bottom diagonal-middle-bottom-2"></div>
          <div className="diagonal-middle-bottom diagonal-middle-bottom-3"></div>
          <div className="diagonal-middle-bottom diagonal-middle-bottom-4"></div>
        </div>
        <APIDocumentation endpoints={endpoints} />
      </div>
      <div className="diagonal-bottom diagonal-bottom-1"></div>
      <div className="diagonal-bottom diagonal-bottom-2"></div>
      <div className="diagonal-bottom diagonal-bottom-3"></div>
      <div className="diagonal-bottom diagonal-bottom-4"></div>
    </main>
  ) : (
    <div>
      <Header />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "80vh",
        }}
      >
        <div style={{ display: "block" }}>
          <div className="page-loader" style={{ textAlign: "center" }}>
            <BarLoader color="#ccc" size={150} cssOverride={override} />
            <br />
            <span style={{ color: "#ccc" }}>Loading...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
