"use client";
import React from "react";
import Link from "next/link";
import { FaChevronCircleRight } from "react-icons/fa";
import AgentCard from "./AgentCard";
import Counters from "./Counters";

const Hero = ({ data }) => {
  return (
    <div className="beta-content">
      <div className="beta-content-left">
        <h1>What is JailbreakMe?</h1>
        <hr />
        <p>
          The first open-source decentralized app where organizations test their
          AI models and agents while users earn rewards for jailbreaking them.
        </p>
        <Counters data={data} />
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
