"use client";
import React, { useState, useEffect, useRef, use } from "react";
import axios from "axios";
import { FaSadCry } from "react-icons/fa";
import RingLoader from "react-spinners/RingLoader";
import BarLoader from "react-spinners/BarLoader";

import Image from "next/image";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import "../../../styles/Chat.css";
import MainMenu from "../../components/MainMenu";
import { PiPaperPlaneRightFill } from "react-icons/pi";

import bs58 from "bs58";
import TimeAgo from "react-timeago";
import CountUp from "react-countup";
import Jdenticon from "react-jdenticon";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function ParsedText({ message }) {
  const processMessage = (message) => {
    const lines = message.split("\n");
    const processed = [];
    let codeBlock = null;

    lines.forEach((line) => {
      if (line.startsWith("```")) {
        if (codeBlock !== null) {
          processed.push({ type: "code", content: codeBlock });
          codeBlock = null;
        } else {
          codeBlock = "";
        }
      } else if (codeBlock !== null) {
        codeBlock += line + "\n";
      } else {
        processed.push({ type: "text", content: line });
      }
    });

    if (codeBlock !== null) {
      processed.push({ type: "code", content: codeBlock });
    }

    return processed;
  };

  const contentBlocks = processMessage(message);

  return (
    <div>
      {contentBlocks.map((block, index) => {
        if (block.type === "code") {
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
  const id = use(params).id;
  const [pageLoading, setPageLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState(null);
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [challenge, setChallenge] = useState({});
  const [prompt, setPrompt] = useState("");
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ca, setCa] = useState("");
  const [threshold, setThreshold] = useState(0);
  const [userAvatar, setUserAvatar] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [price, setPrice] = useState(0.1);

  const tooltipRef = useRef(null);

  const messagesEndRef = useRef(null);
  const chatRef = useRef(null);

  const { publicKey, sendTransaction, connected } = useWallet();
  const SOLANA_RPC =
    "https://special-cold-shard.solana-devnet.quiknode.pro/2e94b18cb7833ffd1e49b6e452de98cfef68a753"; // Or your preferred RPC endpoint

  const processPayment = async () => {
    if (!connected || !publicKey) {
      setError("Please connect your wallet first");
      return false;
    }

    try {
      const connection = new Connection(SOLANA_RPC);
      const recipientAddress = new PublicKey(
        "2Ggmdr2qpuMsd7sGiCwPRBzoA3uXn6Tf6oTycg3fxAPB"
      ); // Replace with your address
      const lamports = Math.round(0.1 * LAMPORTS_PER_SOL);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientAddress,
          lamports: lamports,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature,
        ...latestBlockhash,
      });
      return true;
    } catch (err) {
      console.error(err);
      setError("Payment failed. Please try again.");
      setLoadingPayment(false);
      return false;
    }
  };

  async function read(reader, initial) {
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
      return messagesCopy;
    });

    // const randomNumber = Math.floor(Math.random() * (400 - 300) + 100);
    await delay(150);
    return read(reader);
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  useEffect(() => {
    getChallenge(true);
    const interval = setInterval(() => getChallenge(true), 3000);
    return () => clearInterval(interval);
  }, [id]);

  const getChallenge = async (noLoading) => {
    if (!noLoading) {
      setPageLoading(true);
      setLoadingMessage("Loading Interface...");
    }
    try {
      const data = await axios
        .get(`/api/challenges/get-challenge?id=${id}`)
        .then((res) => res.data)
        .catch((err) => err);

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
    } catch (err) {
      setPageLoading(false);
      setLoadingMessage(null);
      setError("Falied to fetch challenge");
    }
  };

  const conversationCall = async (url, body) => {
    setLoading(true);
    setPageLoading(false);
    setLoadingMessage("");

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setAllowed(true);
        setError("");
        const reader = response.body.getReader();
        return read(reader);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError("Failed to send message");
      throw err;
    }
  };

  const sendPrompt = async () => {
    try {
      // Process payment before sending prompt
      setLoadingPayment(true);
      const paymentSuccess = await processPayment();
      if (!paymentSuccess) return;
      setLoadingPayment(false);
      setConversation((prevMessages) => [
        ...prevMessages,
        { role: "user", content: prompt, address: publicKey.toString() },
      ]);
      scrollToBottom();

      const promptUrl = `/api/conversation/submit/${id}`;
      const body = {
        prompt,
        walletAddress: publicKey.toString(),
      };

      await conversationCall(promptUrl, body);
      setPrompt("");
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    await sendPrompt();
  };

  const onChange = (e) => {
    setPrompt(e.target.value);
  };

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
                      submit(e);
                    }}
                    onChange={onChange}
                    allowed={true}
                    button={
                      connected ? (
                        <button
                          style={{ display: "flex" }}
                          className="pointer"
                          type="submit"
                        >
                          {loadingPayment ? (
                            <RingLoader color="#ccc" size={14} />
                          ) : (
                            <PiPaperPlaneRightFill className="pointer" />
                          )}
                        </button>
                      ) : (
                        <WalletMultiButton />
                      )
                    }
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
