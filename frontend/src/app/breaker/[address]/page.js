"use client";

import { useEffect, useState, use } from "react";
import Jdenticon from "react-jdenticon";
import Header from "../../components/templates/Header";
import "../../../styles/Profile.css";
import PageLoader from "../../components/templates/PageLoader";
import CountUp from "react-countup";
import {
  GiDiamondTrophy,
  GiReceiveMoney,
  GiBreakingChain,
} from "react-icons/gi";
import { FaCopy, FaCheckCircle } from "react-icons/fa";

export default function Breaker({ params }) {
  const address = use(params).address;
  const [challenges, setChallenges] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [userStats, setUserStats] = useState({
    totalUsdPrize: 0,
    totalWins: 0,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [chatCount, setChatCount] = useState(0);
  const [data, setData] = useState(null);
  const fetchBreakerData = async () => {
    try {
      const response = await fetch(`/api/conversation/breakers/${address}`);
      const data = await response.json();
      if (data.conversations) {
        setData(data);
        setConversations(data.conversations);
        setChallenges(data.challenges);
        setChatCount(data.chatCount);
        setUserStats({
          totalUsdPrize: data.challenges[0]?.totalUsdPrize || 0,
          totalWins: data.challenges[0]?.totalWins || 0,
        });
        setActiveChallenge(data.conversations[0]?.name);
        setActiveConversation(data.conversations[0]);
      } else {
        setError({ message: "Invalid data structure from API." });
      }
    } catch (error) {
      setError(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBreakerData();
  }, [address]);

  const handleTabClick = (challengeName) => {
    setActiveChallenge(challengeName);
    const selectedChallenge = challenges.find(
      (challenge) => challenge.name === challengeName
    );
    const selectedConversation = conversations.find(
      (conversation) => conversation.name === challengeName
    );
    setActiveConversation(selectedConversation);
    if (selectedChallenge) {
      setUserStats({
        totalUsdPrize: selectedChallenge.totalUsdPrize,
        totalWins: selectedChallenge.totalWins,
      });
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  if (error) {
    return (
      <div className="beta-container">
        <Header />
        <div
          className="error-message"
          style={{ marginTop: "20px", color: "red" }}
        >
          Error: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="beta-page">
      <div className="beta-container">
        <Header activeChallenge={data?.activeChallenge} />
        {loading ? (
          <PageLoader />
        ) : (
          <>
            <div className="profile-box">
              <div className="profile-info">
                <div className="profile-info-header">
                  <Jdenticon value={address} size={"50"} />
                  <p
                    className="beta-breaker-address pointer"
                    onClick={copyAddress}
                  >
                    {copied ? (
                      <FaCheckCircle size={16} />
                    ) : (
                      <FaCopy size={16} className="pointer" />
                    )}
                    {address.slice(0, 4)}...
                    {address.slice(-4)}
                  </p>
                </div>

                <div className="profile-info-stats">
                  <div>
                    <GiReceiveMoney
                      size={36}
                      style={{ border: "6px double #0BBF99", padding: "10px" }}
                    />
                    <p>Total Prize</p>
                    <hr />
                    <CountUp
                      end={userStats.totalUsdPrize.toFixed(0)}
                      prefix="$"
                      start={0}
                      duration={2.75}
                      decimals={0}
                      decimal="."
                    />
                  </div>
                  <div>
                    <GiDiamondTrophy
                      size={36}
                      style={{ border: "6px double #0BBF99", padding: "10px" }}
                    />
                    <p>Total Wins</p>
                    <hr />
                    <CountUp
                      end={userStats.totalWins}
                      start={0}
                      duration={2.75}
                      decimals={0}
                    />
                  </div>
                  <div>
                    <GiBreakingChain
                      size={36}
                      style={{ border: "6px double #0BBF99", padding: "10px" }}
                    />
                    <p>Break Attempts</p>
                    <hr />
                    <CountUp
                      end={chatCount}
                      start={0}
                      duration={2.75}
                      decimals={0}
                    />
                  </div>
                </div>
              </div>
            </div>
            <hr style={{ border: "1px solid #0BBF99" }} />
            <div className="tabs">
              {conversations.map((conversation) => (
                <button
                  key={conversation.name}
                  className={`tab pointer ${
                    activeChallenge === conversation.name ? "active" : ""
                  }`}
                  onClick={() => handleTabClick(conversation.name)}
                >
                  <img
                    src={conversation.pfp}
                    alt={conversation.name}
                    className="pointer"
                  />
                  {conversation.name}
                </button>
              ))}
            </div>
            <hr style={{ border: "1px solid #0BBF99" }} />
            <div className="chat-container">
              {activeConversation?.conversations?.map((message, index) => (
                <div key={index} className={`chat-message ${message.role}`}>
                  <div className="chat-role">
                    {message.role === "user" ? (
                      <Jdenticon value={address} size={"20"} />
                    ) : (
                      <img
                        src={activeConversation.pfp}
                        alt={activeConversation.name}
                      />
                    )}
                  </div>
                  <div className="chat-text">{message.content}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
