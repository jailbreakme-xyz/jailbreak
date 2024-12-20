"use client";
import React, { useEffect, useState } from "react";
import Footer from "../components/templates/Footer";
import Jdenticon from "react-jdenticon";
import CountUp from "react-countup";
import { ImCross } from "react-icons/im";
import axios from "axios";
import Header from "../components/templates/Header";
import PageLoader from "../components/templates/PageLoader";
import AgentCard from "../components/templates/AgentCard";

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [error, setError] = useState(null);

  const fetchAgents = async () => {
    if (page > 1) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    const response = await axios
      .get(`/api/data/agents?page=${page}`)
      .then((res) => res.data);
    setAgents([...agents, ...response?.agents]);
    setLoading(false);
    setLoadingMore(false);
  };

  useEffect(() => {
    fetchAgents();
  }, [page]);

  return (
    <div className="fullWidthPage">
      <Header />
      {loading ? (
        <PageLoader />
      ) : (
        <div className="beta-container">
          <div
            className="all-agents-title"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h1>JailbreakMe Agents 🤖</h1>
            {/* <div>
              <CountUp end={count} duration={2.75} decimals={0} decimal="." />
              <span> AGENTS</span>
            </div> */}
          </div>
          <hr />
          <div className="beta-agents-list">
            {agents?.map((agent, index) => (
              <AgentCard char={agent} key={index} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            {hasNextPage && (
              <button
                className="beta-breaker-load-more pointer"
                onClick={() => {
                  setPage(page + 1);
                }}
              >
                {loadingMore ? "Loading..." : "Load More"}
              </button>
            )}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
