"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import stoneLogo from "../../assets/stoneLogo.png";
import axios from "axios";
import MainMenu from "../components/MainMenu";
import { FaKey } from "react-icons/fa";
import Link from "next/link";
import MobileMenu from "../components/MobileMenu";
import "../../styles/APIDocumentation.css";
import lightSlogen from "../../assets/lightSlogen.png";

const APIDocs = (props) => {
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);

  const getEndpoints = async () => {
    setLoading(true);
    const data = await axios
      .get(`/api/settings`)
      .then((res) => res.data)
      .catch((err) => err);
    setEndpoints(data.endpoints);
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
    <main className="apiDocsPage">
      <div
        style={{ textAlign: "center", display: "grid", placeItems: "center" }}
      >
        <Image
          alt="logo"
          src={stoneLogo}
          width="80"
          style={{
            borderRadius: "0px 0px 150px 150px",
            marginBottom: "10px",
          }}
        />
        <Image
          className="pointer"
          onClick={() => {
            window.location.href = "/";
          }}
          alt="logo"
          src={lightSlogen}
          width="120"
        />
        <h1 className="api-doc-title">JAILBREAK API</h1>
        <h2 style={{ margin: "5px 0px", color: "#ccc" }}>
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
      <MobileMenu />

      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "75vh",
            color: "#ccc",
          }}
        >
          Loading Endpoints...
        </div>
      ) : (
        <div className="docsPage">
          <MainMenu />
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
    </main>
  );
};

export default APIDocs;
