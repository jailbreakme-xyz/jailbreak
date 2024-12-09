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

export default function Home() {
  const [endpoints, setEndpoints] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  const getEndpoints = async () => {
    setLoading(true);
    const data = await axios
      .get(`/api/settings`)
      .then((res) => res.data)
      .catch((err) => err);
    setEndpoints(data.endpoints);
    setChallenges(data.challenges);
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
          <Header />

          <div className="intro">
            <SocialIcons />
            <p>
              The first open-source decentralized app where organizations test
              their AI models and agents while users earn rewards for
              jailbreaking them.
            </p>
            <Link
              href="/break/Myrios"
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
              <a className="pointer" href="/agent/Myrios">
                MYRIOS
              </a>
              <a className="pointer" href="/jail-token">
                $JAIL
              </a>
            </div>
          </div>

          <HowItWorks />
        </div>
        <div className="section-3">
          <div className="diagonal-middle diagonal-middle-1"></div>
          <div className="diagonal-middle diagonal-middle-2"></div>
          <div className="diagonal-middle diagonal-middle-3"></div>
          <div className="diagonal-middle diagonal-middle-4"></div>
          <div className="activeSection">
            <div className="section-3-title">
              <h1>Active Tournament</h1>
            </div>
            <div className="activeChallenges">
              {challenges?.length > 0 &&
                challenges
                  .filter((s) => s.status !== "closed")
                  .map((char, index) => <Card key={index} char={char} />)}
            </div>
          </div>
          <div className="section-3-title">
            <h1>Coming Soon ↓</h1>
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
                Create Tournament <FaChevronCircleRight className="disabled" />
              </span>
              <span>(Coming Soon)</span>
            </button>
          </div>
          <div className="sliderWrapper">
            {challenges?.length > 0 && (
              <Carousel
                challenges={challenges.filter((s) => s.status !== "active")}
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
