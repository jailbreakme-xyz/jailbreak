"use client";
import React, { useState, useEffect, useRef, use } from "react";
import axios from "axios";
import { FaSadCry } from "react-icons/fa";
import RingLoader from "react-spinners/RingLoader";
import BarLoader from "react-spinners/BarLoader";
import Image from "next/image";
import Footer from "../../components/Footer";
import Header from "../../components/templates/Header";
import "../../../styles/Chat.css";
import { PiPaperPlaneRightFill } from "react-icons/pi";
import PageLoader from "../../components/templates/PageLoader";
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
import AgentInfo from "../../components/templates/AgentInfo";
import ChatMenu from "../../components/templates/ChatMenu";
import ScoreCircle from "../../components/partials/ScoreCircle";

const SOLANA_RPC =
  process.env.NODE_ENV === "development"
    ? "https://brande-ffqoic-fast-devnet.helius-rpc.com"
    : "https://rosette-xbrug1-fast-mainnet.helius-rpc.com";

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
  const [usdPrice, setUsdPrice] = useState(0);
  const [usdPrize, setUsdPrize] = useState(0);
  const [expiry, setExpiry] = useState(null);
  const [solPrice, setSolPrice] = useState(0);
  const [highestScore, setHighestScore] = useState(0);
  const messagesEndRef = useRef(null);
  const chatRef = useRef(null);
  const writingRef = useRef(writing);

  // const shouldScrollRef = useRef(false);

  const { publicKey, sendTransaction, connected } = useWallet();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    writingRef.current = writing;
  }, [writing]);

  useEffect(() => {
    if (publicKey) {
      localStorage.setItem("address", publicKey?.toString());
    }
  }, [publicKey]);

  useEffect(() => {
    scrollToBottom();
  }, [pageLoading]);

  useEffect(() => {
    scrollToBottom();
  }, [attempts]);

  useEffect(() => {
    if (writing) {
      scrollToBottom();
    }
  }, [conversation]);

  useEffect(() => {
    getChallenge(false);
    const interval = setInterval(() => {
      if (!writingRef.current) {
        getChallenge(true);
      }
    }, 3000);
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
          date: new Date().toISOString(),
        };
      } else {
        messagesCopy = [
          ...messagesCopy,
          {
            role: "assistant",
            content: chunk,
            date: new Date().toISOString(),
          },
        ];
      }
      return messagesCopy;
    });

    await delay(20);
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
        setLoading(false);
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
      setError(null);
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
        setUsdPrice((prev) =>
          prev !== data.usdMessagePrice ? data.usdMessagePrice : prev
        );
        setUsdPrize((prev) => (prev !== data.usdPrize ? data.usdPrize : prev));
        setExpiry((prev) => (prev !== data.expiry ? data.expiry : prev));

        setHighestScore((prev) =>
          prev !== data.highestScore ? data.highestScore : prev
        );
        setSolPrice((prev) => (prev !== data.solPrice ? data.solPrice : prev));
        const lastMessage = data.chatHistory[data.chatHistory?.length - 1];
        const address = localStorage.getItem("address");

        if (!noLoading) {
          console.log("Updated initial conversation");
          setConversation(data.chatHistory);
        } else if (address && lastMessage?.address != publicKey?.toBase58()) {
          console.log("Updated conversation with new user message");
          setConversation(data.chatHistory);
        }
      }

      setPageLoading(false);
    } catch (err) {
      console.error(err);
      setPageLoading(false);
      setError("Falied to fetch challenge");
    }
  };

  const getTransaction = async () => {
    try {
      const connection = new Connection(SOLANA_RPC, "confirmed");
      const response = await axios.post("/api/transactions/get-transaction", {
        solution: prompt,
        userWalletAddress: publicKey.toString(),
        id: challenge._id,
      });

      const { serializedTransaction, transactionId } = response.data;
      const transaction = Transaction.from(
        Buffer.from(serializedTransaction, "base64")
      );
      const signedTransaction = await sendTransaction(transaction, connection);

      console.log("Transaction sent:", signedTransaction);
      const confirmation = await connection.confirmTransaction({
        signature: signedTransaction,
        commitment: "confirmed",
      });

      if (confirmation.value.err) {
        setError(
          "Transaction failed: " + JSON.stringify(confirmation.value.err)
        );
        return false;
      }

      return { signedTransaction, transactionId };
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
      const { signedTransaction, transactionId } = await getTransaction();
      if (!signedTransaction || !transactionId) return;
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
        signature: signedTransaction,
        transactionId,
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
    const value = e.target.value;
    let sanitizedValue = value;

    if (challenge?.disable?.includes("special_characters")) {
      sanitizedValue = value.replace(/[^a-zA-Z0-9 ]/g, "");
    }

    // Limit the prompt length to challenge.characterLimit
    if (sanitizedValue.length > challenge.characterLimit) {
      sanitizedValue = sanitizedValue.slice(0, challenge.characterLimit);
    }

    if (challenge.charactersPerWord) {
      const maxWordLength = challenge.charactersPerWord;
      const words = sanitizedValue.split(" ");
      const processedWords = words.map((word) => {
        if (word.length > maxWordLength) {
          // Split the word into chunks of maxWordLength and join them with spaces
          const chunks = word.match(new RegExp(`.{1,${maxWordLength}}`, "g"));
          return chunks.join(" ");
        }
        return word;
      });

      sanitizedValue = processedWords.join(" ");
    }

    setPrompt(sanitizedValue);
  };

  return (
    <main className="main">
      <div className="chatPageWrapper fullWidthPage">
        <div className="chatHeader">
          <Header
            solPrice={solPrice}
            challenge={challenge}
            attempts={attempts}
            price={price}
            prize={prize}
            usdPrice={usdPrice}
            usdPrize={usdPrize}
            hiddenItems={["API", "BREAK", "SOCIAL"]}
            component={"break"}
            address={publicKey}
            activeChallenge={challenge}
          />
        </div>
        {pageLoading ? (
          <PageLoader />
        ) : (
          <div className="chatPageMain">
            {challenge?.name && (
              <ChatMenu
                challenge={challenge}
                attempts={attempts}
                price={price}
                usdPrice={usdPrice}
              />
            )}

            <div className="conversationSection">
              <div className="chat-container">
                {challenge?.name && (
                  <div className="poolDiv" style={{ position: "relative" }}>
                    <div
                      className="status-container"
                      style={{
                        display: "flex",
                        justifyContent: "flex-start",
                        alignItems: "center",
                        columnGap: "1px",
                      }}
                    >
                      <div
                        className={`status-bulb ${
                          challenge?.status === "active"
                            ? "live"
                            : challenge?.status === "upcoming"
                            ? "upcoming"
                            : "inactive"
                        }`}
                      ></div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: "bold",
                          textTransform: "uppercase",
                        }}
                      >
                        {challenge?.status === "active"
                          ? "LIVE"
                          : challenge?.status}
                      </div>
                    </div>
                    <h3
                      style={{ textTransform: "uppercase", color: "#09bf99" }}
                    >
                      {challenge?.name} PRIZE POOL
                    </h3>
                    <CountUp
                      style={{ color: "#09bf99" }}
                      start={0}
                      end={challenge.usd_prize ? challenge.usd_prize : usdPrize}
                      duration={2.75}
                      decimals={2}
                      decimal="."
                      prefix="$"
                    />
                    {challenge.agent_logic === "scoring" && (
                      <ScoreCircle score={highestScore} />
                    )}
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
                              <div className="message">
                                <p>{item.content}</p>
                                {item.win && (
                                  <p
                                    style={{
                                      margin: "0px",
                                      backgroundColor: "orange",
                                      color: "black",
                                      padding: "2px 10px",
                                      borderRadius: "30px",
                                      fontSize: "12px",
                                      fontStyle: "italic",
                                      width: "fit-content",
                                    }}
                                  >
                                    🏆 Winner
                                  </p>
                                )}
                                <TimeAgo date={new Date(item.date)} />
                              </div>
                              {challenge?.custom_user_img ? (
                                <div
                                  className="avatar pointer"
                                  onClick={() => {
                                    window.open(
                                      `/breaker/${item.address}`,
                                      "_blank"
                                    );
                                  }}
                                >
                                  <Image
                                    alt="pfp"
                                    src={challenge?.custom_user_img}
                                    width="40"
                                    height="40"
                                    className="avatar-image pointer"
                                    style={{
                                      border: "2px solid red",
                                    }}
                                  />
                                </div>
                              ) : (
                                <div
                                  className="avatar pointer"
                                  style={{
                                    width: "30px",
                                    height: "30px",
                                    padding: "5px",
                                    borderRadius: "50%",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    color: "#1A0047",
                                    border: "2px solid #ebebeb",
                                    fontSize: "12px",
                                    lineHeight: "12px",
                                    overflow: "hidden",
                                  }}
                                  onClick={() => {
                                    window.open(
                                      `/breaker/${item.address}`,
                                      "_blank"
                                    );
                                  }}
                                >
                                  <Jdenticon
                                    value={item.address}
                                    size={"30"}
                                    onClick={() => {
                                      window.open(
                                        `/breaker/${item.address}`,
                                        "_blank"
                                      );
                                    }}
                                  />
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <div className="avatar">
                                <Image
                                  alt="pfp"
                                  src={challenge?.pfp}
                                  width="40"
                                  height="40"
                                  className="avatar-image"
                                  style={{
                                    border: "2px solid #09bf99",
                                  }}
                                />
                              </div>
                              <div className="message">
                                <ParsedText message={item.content} />
                                <TimeAgo date={new Date(item.date)} />
                                {item.address && (
                                  <p
                                    style={{
                                      color: "gray",
                                      fontSize: "12px",
                                      fontStyle: "italic",
                                    }}
                                  >
                                    Responded to: {item.address}
                                  </p>
                                )}
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
                    start_date={challenge?.start_date}
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
            {challenge?.name && <AgentInfo challenge={challenge} />}
          </div>
        )}
      </div>
    </main>
  );
}
