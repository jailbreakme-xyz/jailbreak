"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaKey } from "react-icons/fa";
import Link from "next/link";
import "../../styles/APIDocumentation.css";
import Header from "../components/templates/Header";
import PageLoader from "../components/templates/PageLoader";
import Footer from "../components/templates/Footer";
const APIDocs = (props) => {
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChallenge, setActiveChallenge] = useState(null);

  const getEndpoints = async () => {
    setLoading(true);
    const data = await axios
      .get(`/api/settings`)
      .then((res) => res.data)
      .catch((err) => err);
    setEndpoints(data.endpoints);
    setActiveChallenge(data.activeChallenge);
    setLoading(false);
  };

  useEffect(() => {
    if (!props.endpoints) {
      getEndpoints();
    } else {
      setEndpoints(props.endpoints);
    }
  }, []);

  return (
    <main className="fullWidthPage">
      <div style={{ paddingBottom: "100px" }}>
        <Header activeChallenge={activeChallenge} />
        {loading ? (
          <PageLoader />
        ) : (
          <div className="docsPage beta-container">
            <div
              style={{
                textAlign: "left",
                display: "grid",
                placeItems: "start",
                gap: "3px",
              }}
            >
              <h1 style={{ margin: "20px 0px 0px" }}>JAILBREAK API</h1>
              <h2 className="comingSoonApiTitle" style={{ margin: "5px 0px" }}>
                Secure AI Agents (Coming Soon)
              </h2>
              <Link
                href="https://forms.gle/yDAWNAqw9JqkFJv37"
                target="_blank"
                className="pointer"
              >
                <button
                  className="styledBtn stoneBtn pointer applyButton"
                  style={{ width: "100%" }}
                >
                  <FaKey size={20} /> APPLY FOR PRO ACCESS
                </button>
              </Link>
            </div>
            <hr />
            <div
              className="api-doc-container"
              style={{ backgroundColor: "black" }}
            >
              {endpoints.map((category, index) => (
                <div key={index} className="api-doc-accordion">
                  <div className={`accordion-header`}>
                    <h2>{category.category}</h2>
                  </div>

                  <div className="accordion-content">
                    <p className="base-url">Base URL: {category.baseURL}</p>
                    {category.endpoints.map((endpoint, idx) => (
                      <div key={idx} className="api-card">
                        <h3>
                          <span className="method">{endpoint.method}</span>{" "}
                          {endpoint.route}
                        </h3>
                        <p className="description">{endpoint.description}</p>
                        <p className="auth">
                          {endpoint.auth
                            ? "🔒 Authentication Required"
                            : "🌍 Public"}
                        </p>
                        <div className="example-section">
                          <strong>Example Request:</strong>
                          <pre>
                            {JSON.stringify(endpoint.example.request, null, 2)}
                          </pre>
                        </div>
                        {endpoint.example.body && (
                          <div className="example-section">
                            <strong>Request Body:</strong>
                            <pre>
                              {JSON.stringify(endpoint.example.body, null, 2)}
                            </pre>
                          </div>
                        )}
                        <div className="example-section">
                          <strong>Example Response:</strong>
                          <pre>
                            {JSON.stringify(endpoint.example.response, null, 2)}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
};

export default APIDocs;
