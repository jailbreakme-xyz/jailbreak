"use client";
import React, { useState, useEffect, useRef, use } from "react";
import axios from "axios";
import { FaSadCry, FaClock } from "react-icons/fa";
import { FaChartLine } from "react-icons/fa6";

import RingLoader from "react-spinners/RingLoader";
import BarLoader from "react-spinners/BarLoader";

import Image from "next/image";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import "../../../styles/Chat.css";
import MainMenu from "../../components/MainMenu";
import { PiPaperPlaneRightFill } from "react-icons/pi";
import { createHash } from "crypto";

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
  TransactionInstruction,
} from "@solana/web3.js";
import Timer from "../../components/partials/Timer";

const SOLANA_RPC =
  "https://special-cold-shard.solana-mainnet.quiknode.pro/2e94b18cb7833ffd1e49b6e452de98cfef68a753";

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

const hashString = (str) => {
  return createHash("sha256").update(str, "utf-8").digest();
};

const calculateDiscriminator = (instructionName) => {
  const hash = createHash("sha256")
    .update(`global:${instructionName}`, "utf-8")
    .digest();
  return hash.slice(0, 8); // Extract first 8 bytes
};

export default function Challenge({ params }) {
  const name = use(params).name;
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [challenge, setChallenge] = useState({});
  const [prompt, setPrompt] = useState("");
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [writing, setWriting] = useState(false);
  const [lastMessageDate, setLastMessageDate] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [price, setPrice] = useState(0);
  const [prize, setPrize] = useState(0);
  const [expiry, setExpiry] = useState(null);

  const messagesEndRef = useRef(null);
  const chatRef = useRef(null);
  // const shouldScrollRef = useRef(false);

  const { publicKey, sendTransaction, connected } = useWallet();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [pageLoading]);

  useEffect(() => {
    if (writing) {
      scrollToBottom();
    }
  }, [conversation]);

  useEffect(() => {
    getChallenge(false);
    const interval = setInterval(() => getChallenge(true), 3000);
    return () => clearInterval(interval);
  }, [name]);

  async function read(reader) {
    setWriting(true);
    const { done, value } = await reader.read();
    if (done) {
      console.log("Stream completed");
      setWriting(false);
      return;
    }
    const chunk = new TextDecoder("utf-8").decode(value);

    setConversation((prevMessages) => {
      setLoading(false);
      let messagesCopy = [...prevMessages];
      const lastMessage = messagesCopy[messagesCopy.length - 1];
      if (lastMessage && lastMessage.role === "assistant") {
        messagesCopy[messagesCopy.length - 1] = {
          ...lastMessage,
          content: lastMessage.content + chunk,
          date: messagesCopy.date
            ? messagesCopy.date
            : new Date().toISOString(),
        };
      } else {
        messagesCopy = [
          ...messagesCopy,
          {
            role: "assistant",
            content: chunk,
            date: messagesCopy.date
              ? messagesCopy.date
              : new Date().toISOString(),
          },
        ];
      }
      return messagesCopy;
    });

    await delay(150);
    return read(reader);
  }

  const conversationCall = async (url, body) => {
    setLoading(true);
    setPageLoading(false);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
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

  const getChallenge = async (noLoading) => {
    if (!noLoading) {
      setPageLoading(true);
    }
    try {
      const data = await axios
        .get(
          `/api/challenges/get-challenge?name=${name}&initial=${!noLoading}&price=${price}`
        )
        .then((res) => res.data)
        .catch((err) => err);

      if (!writing) {
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
        setPrize((prev) => (prev !== data.prize ? data.prize : prev));
        setExpiry((prev) => (prev !== data.expiry ? data.expiry : prev));

        const lastMessage = data.chatHistory[data.chatHistory.length - 1];
        setConversation(data.chatHistory);

        // if (!noLoading) {
        //   console.log("Updated initial conversation");
        //   setConversation(data.chatHistory);
        // } else if (publicKey && lastMessage.address != publicKey?.toBase58()) {
        //   console.log("Updated conversation with new user message");
        //   setConversation(data.chatHistory);
        // }
      }

      setPageLoading(false);
    } catch (err) {
      console.error(err);
      setPageLoading(false);
      setError("Falied to fetch challenge");
    }
  };

  const processPayment = async () => {
    if (!connected || !publicKey) {
      setError("Please connect your wallet first");
      return false;
    }

    try {
      const connection = new Connection(SOLANA_RPC, "confirmed");
      const tournamentAccountInfo = await connection.getAccountInfo(
        new PublicKey(challenge.tournamentPDA)
      );
      if (!tournamentAccountInfo) {
        throw new Error("Tournament account not found");
      }

      const solutionHash = hashString(prompt);
      const discriminator = calculateDiscriminator("submit_solution");

      const data = Buffer.concat([discriminator, solutionHash]);

      const keys = [
        {
          pubkey: new PublicKey(challenge.tournamentPDA),
          isSigner: false,
          isWritable: true,
        },
        { pubkey: publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ];

      const instruction = new TransactionInstruction({
        keys,
        programId: new PublicKey(challenge.idl.address),
        data,
      });

      const transaction = new Transaction().add(instruction);
      const signature = await sendTransaction(transaction, connection);
      console.log("Transaction sent:", signature);

      await connection.confirmTransaction(signature, "confirmed");
      console.log("Transaction confirmed");

      return signature;
    } catch (err) {
      console.error("Error processing payment:", err);
      setError("Payment failed. Please try again.");
      setLoadingPayment(false);
      return false;
    }
  };

  const sendPrompt = async () => {
    try {
      setWriting(true);
      setLoadingPayment(true);
      const signature = await processPayment();
      if (!signature) return;
      setLoadingPayment(false);
      setConversation((prevMessages) => [
        ...prevMessages,
        {
          role: "user",
          content: prompt,
          address: publicKey.toString(),
          date: new Date().toISOString(),
        },
      ]);

      const promptUrl = `/api/conversation/submit/${challenge._id}`;
      const body = {
        prompt,
        walletAddress: publicKey.toString(),
        signature,
      };

      setPrompt("");
      await conversationCall(promptUrl, body);
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
          <Header
            challenge={challenge}
            attempts={attempts}
            price={price}
            prize={prize}
            hiddenItems={["API", "BREAK"]}
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
              <span style={{ textTransform: "capitalize" }}>
                Loading {name} Interface...
              </span>
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
                        onClick={() => {
                          window.open(`/agent/${challenge?.name}`, "_blank");
                        }}
                        alt="logo"
                        src={challenge?.pfp}
                        width="40"
                        height="40"
                        className="pfp pointer"
                      />
                    </div>
                  </div>
                  <hr />
                  <span>{challenge?.label}</span>
                </div>
              )}
              <div style={{ textAlign: "left" }} className="statsWrapper">
                <h3 style={{ fontSize: "22px", margin: "5px 0px" }}>
                  <FaClock
                    style={{
                      position: "relative",
                      top: "4px",
                    }}
                  />{" "}
                  EXPIRY
                </h3>
                <hr />
                <div className="stats">
                  <Timer expiryDate={expiry} />
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#ccc",
                      lineHeight: "10px",
                    }}
                  >
                    Last sender wins when the timer ends.
                  </p>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#ccc",
                      lineHeight: "1.2rem",
                    }}
                  >
                    Each message rounds the timer up to 1 hour if less than 1
                    hour remains.
                  </p>
                </div>
              </div>
              <div style={{ textAlign: "left" }} className="statsWrapper">
                <h3 style={{ fontSize: "22px", margin: "5px 0px" }}>
                  <FaChartLine
                    style={{
                      position: "relative",
                      top: "4px",
                    }}
                  />{" "}
                  STATS
                </h3>
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
                      decimals={3}
                      decimal="."
                      suffix=" SOL"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="conversationSection">
              <div className="chat-container">
                {challenge?.name && (
                  <div className="poolDiv">
                    <h3
                      style={{ textTransform: "uppercase", color: "#09bf99" }}
                    >
                      {challenge?.name} PRIZE POOL
                    </h3>
                    <CountUp
                      style={{ color: "#09bf99" }}
                      start={0}
                      end={prize}
                      duration={2.75}
                      decimals={2}
                      decimal="."
                      suffix=" SOL"
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
                      <RingLoader color="#09bf99" size={30} />
                    </div>
                  )}
                  <div ref={messagesEndRef}></div>
                </div>
                <div className="chat-footer">
                  <Footer
                    status={challenge?.status}
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
                          style={{
                            display: "flex",
                            color: "#09bf99",
                            backgroundColor: "black",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                          className="pointer"
                          type="submit"
                        >
                          {loadingPayment ? (
                            <RingLoader color="#09bf99" size={18} />
                          ) : (
                            <PiPaperPlaneRightFill
                              className="pointer"
                              size={20}
                            />
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
            <MainMenu
              challenge={challenge}
              hiddenItems={["API", "BREAK"]}
              component="break"
            />
          </div>
        )}
      </div>
    </main>
  );
}
