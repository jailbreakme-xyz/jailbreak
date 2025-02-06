import { Fragment, useState, useEffect, useCallback, useRef } from "react";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { CopyBlock } from "react-code-blocks";
import { FaCopy, FaCheck, FaStream } from "react-icons/fa";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "../styles/ReverseAgent.css";
import Header from "../components/templates/Header";
import Footer from "../components/templates/Footer";
import { FaCookieBite } from "react-icons/fa";
import { MdEngineering } from "react-icons/md";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { duotoneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

// Custom theme matching the docs
const customTheme = {
  lineNumberColor: "#666",
  lineNumberBgColor: "#1a1a1a",
  backgroundColor: "#1a1a1a",
  textColor: "#fff",
  stringColor: "#89ca78",
  numberColor: "#d19a66",
  keywordColor: "#c678dd",
  attributeColor: "#98c379",
  selectorAttributeColor: "#e06c75",
  docColor: "#999",
  commentColor: "#999",
  punctuationColor: "#fff",
  tag: {
    openColor: "#e06c75",
    closeColor: "#e06c75",
    selfCloseColor: "#e06c75",
  },
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const ensureNewlines = (content) => {
  return content
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
};

export default function AgentSelect({ onSelect }) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tweetsLoading, setTweetsLoading] = useState(false);
  const [reverseLoading, setReverseLoading] = useState(false);
  const [tweets, setTweets] = useState(null);
  const [reverseResult, setReverseResult] = useState(null);
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState("");
  const streamRef = useRef(null);
  const autocompleteRef = useRef(null); // Specific ref for autocomplete container

  useEffect(() => {
    if (showSuggestions && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      document.documentElement.style.setProperty(
        "--suggestions-top",
        `${rect.bottom + 4}px`
      );
      document.documentElement.style.setProperty(
        "--suggestions-left",
        `${rect.left}px`
      );
    }
  }, [showSuggestions]);

  // Update click outside handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update position on scroll
  useEffect(() => {
    function handleScroll() {
      if (showSuggestions && inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        document.documentElement.style.setProperty(
          "--suggestions-top",
          `${rect.bottom + 4}px`
        );
        document.documentElement.style.setProperty(
          "--suggestions-left",
          `${rect.left}px`
        );
      }
    }

    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [showSuggestions]);

  // Update streaming content scroll
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [streamContent]);

  const fetchAgents = useCallback(async (searchQuery) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: 100,
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/data/agents-data?${params}`);
      const data = await response.json();
      setAgents(data);
    } catch (error) {
      console.error("Error fetching agents:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const debouncedSearch = useCallback(
    debounce((searchQuery) => {
      fetchAgents(searchQuery);
    }, 300),
    [fetchAgents]
  );

  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setShowSuggestions(true);
    debouncedSearch(newQuery);
  };

  const fetchTweets = async (username) => {
    try {
      setTweetsLoading(true);
      const response = await fetch("/api/submissions/get-top-tweets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: username,
        }),
      });
      const data = await response.json();
      setTweets(data.ok);
    } catch (error) {
      console.error("Error fetching tweets:", error);
    } finally {
      setTweetsLoading(false);
    }
  };

  const handleSelectAgent = (agent) => {
    setReverseResult(null);
    setQuery(agent.agentName);
    setShowSuggestions(false);
    if (onSelect) {
      onSelect(agent);
    }
    // Fetch tweets using the first Twitter username
    if (agent.twitterUsernames && agent.twitterUsernames.length > 0) {
      fetchTweets(agent.twitterUsernames[0]);
    }
  };

  const handleStream = async () => {
    try {
      setReverseLoading(true);
      setStreamContent("");

      const response = await fetch("/api/submissions/reverse-agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: JSON.stringify(tweets),
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      setReverseLoading(false);
      while (true) {
        await delay(20);
        const { value, done } = await reader.read();
        if (done || !value) break;

        const chunk = decoder.decode(value);

        setStreamContent((prev) => prev + chunk);
        setReverseResult((prev) => ({
          ...prev,
          type: "system",
          data: prev ? prev.data + chunk : chunk,
        }));
      }

      //   setReverseResult({
      //     type: "system",
      //     data: streamContent,
      //   });
    } catch (error) {
      console.error("Error in streaming:", error);
    } finally {
      setReverseLoading(false);
    }
  };

  const handleReverseAgent = async () => {
    try {
      setReverseLoading(true);
      const response = await fetch("/api/submissions/reverse-agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: JSON.stringify(tweets),
        }),
      });
      const data = await response.json();
      setReverseResult({
        type: "system",
        data,
      });
    } catch (error) {
      console.error("Error reversing agent:", error);
    } finally {
      setReverseLoading(false);
    }
  };

  const handleReverseEliza = async () => {
    try {
      setReverseLoading(true);
      const response = await fetch("/api/submissions/reverse-eliza-character", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: JSON.stringify(tweets),
        }),
      });
      const data = await response.json();
      setReverseResult({
        type: "eliza",
        data,
      });
    } catch (error) {
      console.error("Error reversing Eliza character:", error);
    } finally {
      setReverseLoading(false);
    }
  };

  const handleCopy = async () => {
    if (reverseResult?.data) {
      await navigator.clipboard.writeText(reverseResult.data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    }
  };

  const formatCodeBlocks = (content) => {
    // First ensure newlines are preserved
    content = ensureNewlines(content);

    // Then handle code blocks
    return content.replace(/```(\s*?)([^:\n]*)\n/, (match, space, lang) => {
      if (!lang) return "```uri\n";
      return match;
    });
  };

  return (
    <div className="page-container fullWidthPage">
      <div className={`content-wrapper`} ref={wrapperRef}>
        <Header />
        <div
          className="autocomplete-wrapper"
          style={{
            minHeight:
              !tweets && !tweetsLoading
                ? "calc(100vh - 92px)"
                : "calc(100vh - 92px)",
            paddingTop: !tweets && !tweetsLoading ? "0" : "0rem",
          }}
          ref={autocompleteRef}
        >
          <div className="autocomplete-container" ref={wrapperRef}>
            <MdEngineering className="engineer-icon" />
            <h3 className="title">Reverse Engineer an Agent</h3>
            <span className="powered-by">
              Integrated with{" "}
              <a
                href="https://cookie.fun"
                target="_blank"
                className="powered-by-link pointer"
              >
                cookie.fun <FaCookieBite />
              </a>
            </span>
            <div className="search-wrapper">
              <HiMagnifyingGlass className="search-icon" />
              <input
                ref={inputRef}
                type="text"
                className="search-input"
                placeholder="Search agents..."
                value={query}
                onChange={handleInputChange}
                onFocus={() => setShowSuggestions(true)}
              />
            </div>

            {showSuggestions && (
              <div className="suggestions-container">
                {loading ? (
                  <div className="loading-message">Loading...</div>
                ) : agents.length === 0 ? (
                  <div className="no-results">No agents found</div>
                ) : (
                  <div className="suggestions-list">
                    {agents.map((agent, index) => (
                      <div
                        key={index}
                        className="suggestion-item pointer"
                        onClick={() => handleSelectAgent(agent)}
                      >
                        <div className="agent-name pointer">
                          {agent.agentName}
                        </div>
                        <div className="twitter-handles pointer">
                          {agent.twitterUsernames.map((username, idx) => (
                            <span key={idx} className="twitter-handle">
                              @{username.replace("@", "")}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div
            className="tweets-container"
            style={{ display: tweets || tweetsLoading ? "block" : "none" }}
          >
            {tweetsLoading ? (
              <div className="tweets-loading">
                <div className="loading-spinner" />
                <div>Fetching tweets...</div>
              </div>
            ) : tweets ? (
              <>
                <div className="code-block-wrapper">
                  <span className="fetched-tweets">
                    <FaCheck /> Fetched Top {tweets.length} Tweets
                  </span>
                </div>

                <div className="reverse-buttons">
                  <button
                    className="reverse-button pointer"
                    onClick={handleStream}
                    disabled={reverseLoading}
                  >
                    Reverse System Prompt
                  </button>
                  <button
                    className="reverse-button pointer"
                    onClick={handleReverseEliza}
                    disabled={reverseLoading}
                  >
                    Reverse Eliza Character
                  </button>
                </div>

                {reverseLoading && (
                  <div className="reverse-loading">
                    <div className="loading-spinner" />
                    <div>Generating reverse prompt...</div>
                  </div>
                )}

                {reverseResult ? (
                  <div className="markdown-container">
                    {reverseResult.type === "system" ? (
                      <div className="markdown-wrapper">
                        <button
                          className="copy-button pointer"
                          onClick={handleCopy}
                          title="Copy to clipboard"
                        >
                          {copied ? <FaCheck /> : <FaCopy />}
                        </button>

                        <div style={{ marginTop: "20px" }}>
                          <Markdown
                            children={formatCodeBlocks(reverseResult.data)}
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ node, ...props }) => {
                                return (
                                  <span
                                    style={{
                                      whiteSpace: "pre-line",
                                      display: "block",
                                      marginBottom: "1em",
                                    }}
                                    {...props}
                                  />
                                );
                              },
                            }}
                          />
                        </div>
                        <div id="stream-ref" ref={streamRef}></div>
                      </div>
                    ) : (
                      <div className="markdown-wrapper">
                        <CopyBlock
                          text={JSON.stringify(reverseResult.data, null, 2)}
                          language="json"
                          showLineNumbers={false}
                          theme={customTheme}
                          codeBlock
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className="markdown-container"
                    style={{
                      marginTop: "5rem",
                      textAlign: "center",
                      fontSize: "1.2rem",
                      color: "#999",
                    }}
                  >
                    <p>
                      Run a reverse engineering process
                      <br />
                      to generate an agent
                    </p>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
