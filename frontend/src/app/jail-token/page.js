"use client";
import React, { useState, useEffect } from "react";
import JailTokensSection from "../components/partials/JailTokensSection";
import "../../styles/FAQ.css";
import axios from "axios";
import Header from "../components/templates/Header";
import Footer from "../components/templates/Footer";
import PageLoader from "../components/templates/PageLoader";

const Token = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeChallenge, setActiveChallenge] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/settings`);
      setData(response.data?.jailToken);
      setActiveChallenge(response.data?.activeChallenge);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <main>
      <div className="beta-container" style={{ paddingBottom: "100px" }}>
        <Header activeChallenge={activeChallenge} />
        {loading ? (
          <PageLoader />
        ) : (
          <div className="docsPage">
            <div style={{ textAlign: "left" }}>
              <h2 className="faq-title">$JAIL Tokens</h2>
            </div>
            <hr />
            <JailTokensSection data={data} />
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
};

export default Token;
