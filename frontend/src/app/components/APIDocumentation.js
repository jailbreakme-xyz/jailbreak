import React from "react";
import Image from "next/image";
import stoneLogo from "../../assets/stone_logo.png";
import { FaKey } from "react-icons/fa";
import Link from "next/link";

import "../../styles/APIDocumentation.css";

const APIDocumentation = (props) => {
  return (
    <div className="api-doc-container" style={{ backgroundColor: "black" }}>
      <div style={{ textAlign: "center" }}>
        <img
          alt="logo"
          src={stoneLogo}
          width="80"
          style={{
            borderRadius: "0px 0px 150px 150px",
            marginBottom: "0px",
          }}
        />
        <h1 className="api-doc-title">JAILBREAK API</h1>
        <h2 style={{ margin: "5px 0px" }}>Secure AI Agents (Coming Soon)</h2>
        <Link
          href="https://forms.gle/yDAWNAqw9JqkFJv37"
          target="_blank"
          className="pointer"
        >
          <button
            className="styledBtn stoneBtn pointer applyButton"
            style={{ border: "0px" }}
          >
            <FaKey size={20} /> APPLY FOR PRO ACCESS
          </button>
        </Link>
      </div>
      <hr />
      {props.endpoints?.map((category, index) => (
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
                  {endpoint.auth ? "🔒 Authentication Required" : "🌍 Public"}
                </p>
                <div className="example-section">
                  <strong>Example Request:</strong>
                  <pre>{JSON.stringify(endpoint.example.request, null, 2)}</pre>
                </div>
                {endpoint.example.body && (
                  <div className="example-section">
                    <strong>Request Body:</strong>
                    <pre>{JSON.stringify(endpoint.example.body, null, 2)}</pre>
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
  );
};

export default APIDocumentation;
