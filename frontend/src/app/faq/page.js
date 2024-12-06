"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import stoneLogo from "../../assets/stoneLogo.png";
import axios from "axios";
import MainMenu from "../components/MainMenu";
import MobileMenu from "../components/MobileMenu";
import "../../styles/FAQ.css";
import lightSlogen from "../../assets/lightSlogen.png";

const FAQ = (props) => {
  const [faqData, setFaqData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const getFaqData = async () => {
    setLoading(true);
    const data = await axios
      .get(`/api/settings`)
      .then((res) => res.data)
      .catch((err) => err);
    setFaqData(data.faq);
    setLoading(false);
  };

  useEffect(() => {
    if (!props.endpoints) {
      getFaqData();
    } else {
      setFaqData(props.endpoints);
    }
  }, []);

  return (
    <main>
      <MobileMenu absolute={true} />
      <div
        style={{ textAlign: "center", display: "grid", placeItems: "center" }}
      >
        <Image
          className="pointer"
          onClick={() => {
            window.location.href = "/";
          }}
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
        <h2 className="faq-title">Frequently Asked Questions</h2>
      </div>
      <hr />
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
          Loading FAQ...
        </div>
      ) : (
        <div className="docsPage">
          <MainMenu />
          <div className="faq-container">
            <div className="faq-items">
              {faqData.map((item, index) => (
                <div key={index} className="faq-item">
                  <div
                    className="faq-question"
                    onClick={() => toggleFAQ(index)}
                  >
                    {item.question}
                    <span className="faq-toggle-icon">
                      {activeIndex === index ? "-" : "+"}
                    </span>
                  </div>
                  {activeIndex === index && (
                    <div className="faq-answer">{item.answer}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default FAQ;
