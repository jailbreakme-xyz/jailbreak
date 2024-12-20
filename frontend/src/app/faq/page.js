"use client";
import React, { useState, useEffect } from "react";

import axios from "axios";
import "../../styles/FAQ.css";
import Header from "../components/templates/Header";
import PageLoader from "../components/templates/PageLoader";
import Footer from "../components/templates/Footer";

const FAQ = (props) => {
  const [faqData, setFaqData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);
  const [activeChallenge, setActiveChallenge] = useState(null);
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
    setActiveChallenge(data.activeChallenge);
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
      <div className="fullWidthPage" style={{ paddingBottom: "100px" }}>
        <Header activeChallenge={activeChallenge} />
        {loading ? (
          <PageLoader />
        ) : (
          <div className="docsPage beta-container">
            <div style={{ textAlign: "left" }}>
              <h2 className="faq-title">Frequently Asked Questions</h2>
            </div>
            <hr />
            <div className="faq-container">
              <div className="faq-items">
                {faqData.map((item, index) => (
                  <div key={index} className="faq-item">
                    <div
                      className="faq-question pointer"
                      onClick={() => toggleFAQ(index)}
                    >
                      {item.question}
                      <span className="faq-toggle-icon pointer">
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
      </div>
      <Footer />
    </main>
  );
};

export default FAQ;
