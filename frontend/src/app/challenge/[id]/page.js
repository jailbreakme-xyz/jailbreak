"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  FaUserSecret,
  FaHome,
  FaUsers,
  FaTelegramPlane,
  FaCode,
  FaQuestionCircle,
  FaFlagCheckered,
  FaShieldVirus,
  FaSadCry,
} from "react-icons/fa";
import RingLoader from "react-spinners/RingLoader";
import BarLoader from "react-spinners/BarLoader";
import { GiPodium } from "react-icons/gi";

import Image from "next/image";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import "../../../styles/Chat.css";
import MainMenu from "../../components/MainMenu";
import WalletConnect from "../../components/WalletConnect";

import bs58 from "bs58";
import TimeAgo from "react-timeago";
import CountUp from "react-countup";
import Jdenticon from "react-jdenticon";

export function ParsedText({ message }) {
  // Function to process the message and return an array of text and code blocks
  const processMessage = (message) => {
    // Splitting the message by lines
    const lines = message.split("\n");
    const processed = [];
    let codeBlock = null;

    lines.forEach((line) => {
      if (line.startsWith("```")) {
        if (codeBlock !== null) {
          // End of a code block
          processed.push({ type: "code", content: codeBlock });
          codeBlock = null;
        } else {
          // Start of a code block
          codeBlock = "";
        }
      } else if (codeBlock !== null) {
        // Inside a code block, accumulate the line
        codeBlock += line + "\n";
      } else {
        // Plain text line
        processed.push({ type: "text", content: line });
      }
    });

    // If a code block is open when the message ends, push it as a code block
    if (codeBlock !== null) {
      processed.push({ type: "code", content: codeBlock });
    }

    return processed;
  };

  // Process the message to separate text and code blocks
  const contentBlocks = processMessage(message);

  return (
    <div>
      {contentBlocks.map((block, index) => {
        if (block.type === "code") {
          // Render code block with a styled <pre> element
          return (
            <pre key={index} className="code-block">
              {block.content}
            </pre>
          );
        } else {
          return block.content.split("\n").map((line, lineIndex) => (
            <React.Fragment key={`${index}-${lineIndex}`}>
              <span className="typewriter">{line}</span>
              <br />
            </React.Fragment>
          ));
        }
      })}
    </div>
  );
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function Challenge({ params }) {
  const [pageLoading, setPageLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState(null);
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [challenge, setChallenge] = useState({});
  const [prompt, setPrompt] = useState("");
  const [walletAddress, setWalletAddress] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ca, setCa] = useState("");
  const [threshold, setThreshold] = useState(0);
  const [userAvatar, setUserAvatar] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [price, setPrice] = useState(0);
  const tooltipRef = useRef(null);

  const messagesEndRef = useRef(null);
  const chatRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  // const getSettings = async () => {
  //   try {
  //     const data = await axios
  //       .get(`/api/settings`)
  //       .then((res) => res.data)
  //       .catch((err) => err);
  //     setThreshold(data.settings.threshold);
  //     setCa(data.settings.address);
  //   } catch (err) {
  //     setError("Error fetching challenge settings");
  //   }
  // };

  // useEffect(() => {
  //   // const _wallet = getWallet();
  //   // if (_wallet) {
  //   //   setWalletAddress(_wallet);
  //   //   getChallenge(_wallet);
  //   // }
  //   getChallenge();
  // }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  useEffect(() => {
    getChallenge(true);
    const interval = setInterval(() => getChallenge(true), 3000);
    return () => clearInterval(interval);
  }, [params.id]);

  const saveWalletAddress = (address) => {
    localStorage.setItem("wallet", address);
  };

  const getWallet = () => {
    return localStorage.getItem("wallet");
  };

  const connectWallet = async (provider) => {
    setError("");
    setLoadingMessage("Connecting...");

    try {
      // Connect the wallet
      await provider.connect();
      const walletPublicKey = provider.publicKey.toString();

      // Generate a unique message for verification
      const uniqueMessage = `Sign this message to verify your wallet ownership.`;

      // Encode the message and request signature
      const encodedMessage = new TextEncoder().encode(uniqueMessage);
      const signature = await provider.signMessage(encodedMessage);

      const token = localStorage.getItem("jwt");

      const headers = { "Content-Type": "application/json" };
      if (token) {
        headers["auth-token"] = token;
      }

      setLoadingMessage("Verifying...");
      // Send the signed message, wallet address, and signature to your backend
      const response = await fetch("/api/verify-wallet", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          walletAddress: walletPublicKey,
          message: uniqueMessage,
          signature: bs58.encode(signature.signature),
        }),
      });

      const result = await response.json();

      if (response.ok && result.verified) {
        // Verification successful
        setError("");
        localStorage.setItem("jwt", result.token);
        setWalletAddress(walletPublicKey);
        saveWalletAddress(walletPublicKey);
        setAllowed(true);
        getChallenge(walletPublicKey);
      } else if (result.error) {
        setLoadingMessage("");
        setPageLoading(false);
        setError(result.error);
      } else {
        // Verification failed
        console.error("Verification failed:", result.error || "Unknown error");
        setError("Wallet verification failed.");
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error connecting to wallet:", err);
      alert("Failed to connect wallet.");
      setError("Failed to connect wallet.");
      setLoadingMessage("");
      setIsModalOpen(false);
    }
  };

  const getChallenge = async (noLoading) => {
    if (!noLoading) {
      setPageLoading(true);
      setLoadingMessage("Loading Interface...");
    }
    try {
      const data = await axios
        .get(`/api/challenges/get-challenge?id=${params.id}`)
        .then((res) => res.data)
        .catch((err) => err);

      // setChallenge(data.challenge);
      // setAttempts(data.break_attempts);
      // setPrice(data.message_price);
      // setConversation(data.chatHistory);

      setChallenge((prev) =>
        JSON.stringify(prev) !== JSON.stringify(data.challenge)
          ? data.challenge
          : prev
      );
      setAttempts((prev) =>
        prev !== data.break_attempts ? data.break_attempts : prev
      );
      setPrice((prev) =>
        prev !== data.message_price ? data.message_price : prev
      );
      setConversation((prev) =>
        JSON.stringify(prev) !== JSON.stringify(data.chatHistory)
          ? data.chatHistory
          : prev
      );

      setPageLoading(false);
      setLoadingMessage(null);

      // const initialUrl = `/api/conversation/init/${params.id}`;
      // conversationCall(initialUrl, {}, true);
    } catch (err) {
      setPageLoading(false);
      setLoadingMessage(null);
      setError("Falied to fetch challenge");
    }
  };

  async function read(reader, initial) {
    // scrollToBottom();
    if (!initial) {
      setLoading(false);
    }
    const { done, value } = await reader.read();
    if (done) {
      if (initial) {
        setLoading(false);
      }
      console.log("Stream completed");
      return;
    }
    const chunk = new TextDecoder("utf-8").decode(value);

    setConversation((prevMessages) => {
      let messagesCopy = [...prevMessages];
      const lastMessage = messagesCopy[messagesCopy.length - 1];
      if (lastMessage && lastMessage.role === "assistant") {
        messagesCopy[messagesCopy.length - 1] = {
          ...lastMessage,
          content: lastMessage.content + chunk,
        };
      } else {
        messagesCopy = [...messagesCopy, { role: "assistant", content: chunk }];
      }
      // scrollToBottom();
      return messagesCopy;
    });

    const randomNumber = Math.floor(Math.random() * (400 - 300) + 100);
    await delay(150);
    return read(reader);
  }

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const conversationCall = async (url, body, isInitial) => {
    setLoading(true);
    setPageLoading(false);
    setLoadingMessage("");
    const token = localStorage.getItem("jwt");

    try {
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify(body),
      })
        .then(async (response) => {
          if (response.ok) {
            setAllowed(true);
            setError("");
            if (isInitial) {
              const result = await response.json();
              setLoading(false);
              setConversation(result.chatHistory);
            } else {
              const reader = response.body.getReader();
              return read(reader, isInitial);
            }
          }
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError("Falied to send message");
    }
  };

  const sendPrompt = () => {
    if (!walletAddress) {
      alert("Please connect your wallet to continue.");
      return;
    }

    setConversation((prevMessages) => [
      ...prevMessages,
      { role: "user", content: prompt, address: walletAddress },
    ]);
    scrollToBottom();
    const promptUrl = `/api/conversation/submit/${params.id}`;
    const body = {
      prompt: prompt,
      walletAddress,
    };
    conversationCall(promptUrl, body);
    setPrompt("");
  };

  const submit = async (e) => {
    e.preventDefault();
    sendPrompt();
  };

  const onChange = (e) => {
    setPrompt(e.target.value);
  };

  // const fetchMessages = async () => {
  //   try {
  //     const url = `/api/conversation/init/${params.id}`;
  //     const token = localStorage.getItem("jwt");
  //     fetch(url, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         "auth-token": token,
  //       },
  //       body: JSON.stringify({ address: walletAddress }),
  //     })
  //       .then(async (response) => {
  //         const result = await response.json();
  //         // if (
  //         //   result?.chatHistory[result.chatHistory.length - 1]?.content !=
  //         //   conversation[conversation.length - 1]?.content
  //         // ) {
  //         //   setConversation(result.chatHistory);
  //         // }
  //         setConversation(result.chatHistory);

  //         // if (!userAvatar) {
  //         //   setUserAvatar(
  //         //     <NiceAvatar
  //         //       style={{ width: 30, height: 30 }}
  //         //       {...result.userAvatar}
  //         //     />
  //         //   );
  //         // }
  //       })
  //       .catch((err) => {
  //         console.error(err);
  //         setLoading(false);
  //       });
  //   } catch (err) {
  //     console.error("Error fetching messages:", err);
  //   }
  // };

  const override = {
    display: "block",
    margin: "0 auto",
    width: "200px",
  };

  return (
    <main className="main">
      <div className="chatPageWrapper">
        <div className="chatHeader">
          <Header attempts={attempts} price={price} prize={1526.34} />
          <WalletConnect
            isModalOpen={isModalOpen}
            walletAddress={walletAddress}
            setWalletAddress={setWalletAddress}
            setIsModalOpen={setIsModalOpen}
            connectWallet={(provider) => connectWallet(provider)}
            setAllowed={setAllowed}
          />
          <hr />
        </div>
        {pageLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: "75vh",
            }}
          >
            <div className="page-loader">
              <BarLoader color="#ccc" size={150} cssOverride={override} />
              <br />
              <span>Loading Interface...</span>
            </div>
          </div>
        ) : (
          <div className="chatPageMain">
            <div className="chatMenu desktopChatMenu">
              {challenge?.title && (
                <div className="challengeTitle">
                  <div
                    style={{
                      display: "inline-flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <div>
                      <h2 style={{ margin: "0px" }}>{challenge?.title}</h2>
                      <span className={`${challenge?.level} level`}>
                        {challenge?.level}
                      </span>
                    </div>
                    <div>
                      <Image
                        alt="logo"
                        src={challenge?.pfp}
                        width="30"
                        height="30"
                        className="pfp"
                      />
                    </div>
                  </div>
                  <hr />
                  <span>{challenge?.label}</span>
                </div>
              )}
              <div style={{ textAlign: "left" }} className="statsWrapper">
                <h3>Stats</h3>
                <hr />
                <div className="stats">
                  <div className="chatComingSoonMenuItem">
                    <h4>Break Attempts</h4>
                    <CountUp
                      start={0}
                      end={attempts}
                      duration={2.75}
                      decimals={0}
                      decimal="."
                    />
                  </div>
                  <div className="chatComingSoonMenuItem">
                    <h4>Message Price</h4>
                    <CountUp
                      start={0}
                      end={price}
                      duration={2.75}
                      decimals={2}
                      decimal="."
                      prefix="$"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="conversationSection">
              <div className="chat-container">
                {challenge?.name && (
                  <div className="poolDiv">
                    <h3 style={{ textTransform: "uppercase" }}>
                      {challenge?.name} PRIZE POOL
                    </h3>
                    <CountUp
                      start={500}
                      end={1526.34}
                      duration={2.75}
                      decimals={2}
                      decimal="."
                      prefix="$"
                    />
                  </div>
                )}
                <div className="challengeTitle mobileOnly">
                  <div
                    style={{
                      display: "inline-flex",
                      justifyContent: "space-between",
                      alignItems: "top",
                      width: "100%",
                      columnGap: "5px",
                    }}
                  >
                    <div>
                      <Image
                        alt="logo"
                        src={challenge?.pfp}
                        width="30"
                        height="30"
                        className="pfp"
                      />
                    </div>
                    <span> {challenge?.label}</span>
                  </div>
                </div>
                <div
                  ref={chatRef}
                  id="conversationContainer"
                  className="conversation"
                >
                  {conversation && conversation.length > 0
                    ? conversation.map((item, index) => (
                        <div className={`chat-bubble ${item.role}`} key={index}>
                          {item.role === "user" ? (
                            <>
                              <div
                                className="avatar"
                                style={{
                                  // backgroundColor: "white",
                                  width: "25px",
                                  height: "25px",
                                  padding: "5px",
                                  borderRadius: "50%",
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  color: "#1A0047",
                                  border: "1px solid #ccc",
                                  fontSize: "12px",
                                  lineHeight: "12px",
                                  overflow: "hidden",
                                }}
                              >
                                <Jdenticon value={item.address} size={"30"} />
                                {/* <span style={{ margin: 0, padding: 0 }}>
                                  {item.address.slice(0, 2)}
                                </span>
                                <span style={{ margin: 0, padding: 0 }}>
                                  {item.address.slice(2, 4)}
                                </span> */}
                              </div>

                              <div className="message">
                                <p>{item.content}</p>
                                <TimeAgo date={new Date(item.date)} />
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="message">
                                <ParsedText message={item.content} />
                                <TimeAgo date={new Date(item.date)} />
                              </div>
                              <div className="avatar">
                                <Image
                                  alt="pfp"
                                  src={challenge?.pfp}
                                  width="30"
                                  height="30"
                                  className="avatar-image"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    : error && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            width: "100%",
                            height: "55vh",
                          }}
                        >
                          <div style={{ display: "block" }}>
                            <FaSadCry size={44} />
                            <h2>{error}</h2>
                          </div>
                        </div>
                      )}
                  {loading && conversation?.length > 0 && (
                    <div className="loading-indicator">
                      <RingLoader color="#ccc" size={30} />
                    </div>
                  )}
                  <div ref={messagesEndRef}></div>
                </div>
                <div className="chat-footer">
                  <Footer
                    value={prompt}
                    task={challenge?.task}
                    submit={(e) => {
                      e.preventDefault();
                      allowed && !error ? submit(e) : setIsModalOpen(true);
                    }}
                    onChange={onChange}
                    allowed={allowed && !error}
                  />
                </div>
              </div>
            </div>
            <MainMenu />
          </div>
        )}
      </div>
    </main>
  );
}
