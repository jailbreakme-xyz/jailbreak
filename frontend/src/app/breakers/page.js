"use client";
import React, { useEffect, useState } from "react";
import Footer from "../components/templates/Footer";
import Jdenticon from "react-jdenticon";
import CountUp from "react-countup";
import { ImCross } from "react-icons/im";
import axios from "axios";
import Header from "../components/templates/Header";
import PageLoader from "../components/templates/PageLoader";

export default function Breakers() {
  const [topBreakers, setTopBreakers] = useState([]);
  const [topChatters, setTopChatters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [error, setError] = useState(null);

  const fetchBreakers = async () => {
    if (page > 1) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    const breakers = await axios
      .get(`/api/data/breakers?page=${page}`)
      .then((res) => res.data);
    setTopBreakers([...topBreakers, ...breakers?.topBreakers]);
    setTopChatters([...topChatters, ...breakers?.topChatters]);
    setCount(breakers?.count);
    setHasNextPage(breakers?.hasNextPage);
    setLoading(false);
    setLoadingMore(false);
  };

  useEffect(() => {
    fetchBreakers();
  }, [page]);

  return (
    <div className="fullWidthPage">
      <Header />
      {loading ? (
        <PageLoader />
      ) : (
        <div className="beta-container">
          <div
            className="all-breakers-title"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h1>JailbreakMe Community 🔥</h1>
            <div>
              <CountUp end={count} duration={2.75} decimals={0} decimal="." />
              <span> BREAKERS</span>
            </div>
          </div>
          <hr />
          <div className="beta-breakers-list">
            {topBreakers?.concat(topChatters)?.map((breaker, index) => (
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
