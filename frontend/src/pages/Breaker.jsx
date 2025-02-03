import { useEffect, useState, use } from "react";
import Jdenticon from "react-jdenticon";
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  Avatar,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  GiDiamondTrophy,
  GiReceiveMoney,
  GiBreakingChain,
  GiArtificialIntelligence,
} from "react-icons/gi";
import { FaCopy, FaCheckCircle, FaRobot, FaComments } from "react-icons/fa";
import CountUp from "react-countup";
import Header from "../components/templates/Header";
import PageLoader from "../components/templates/PageLoader";
import Footer from "../components/templates/Footer";
import AgentCardAlt from "../components/templates/AgentCardAlt";
import ChallengeItem from "../components/templates/ChallengeItem";
import {
  AgentCardSkeleton,
  ChallengeItemSkeleton,
} from "../components/templates/Skeleton";
import { useWallet } from "@solana/wallet-adapter-react";
import AdvancedModal from "../components/templates/AdvancedModal";
import bs58 from "bs58";
import { ImCross } from "react-icons/im";
import { FaSadCry } from "react-icons/fa";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { useParams, useNavigate } from "react-router-dom";
import ApiKeyModal from "../components/templates/modals/ApiKeyModal";

export default function Breaker() {
  const { address } = useParams();
  const { publicKey, connected, wallet } = useWallet();
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
  const [tabValue, setTabValue] = useState(0);
  const [ownedAgents, setOwnedAgents] = useState([]);
  const [advancedModalOpen, setAdvancedModalOpen] = useState(false);
  const [advancedModalAgent, setAdvancedModalAgent] = useState(null);
  const [editError, setEditError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchBreakerData();
  }, [address]);

  const handleTabClick = (challengeName) => {
    setActiveChallenge(challengeName);
    const selectedConversation = conversations.find(
      (conversation) => conversation.name === challengeName
    );
    setActiveConversation(selectedConversation);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleAdvancedModalOpen = (agent) => {
    fetchFullAgent(agent);
  };

  const handleAdvancedModalClose = () => {
    setAdvancedModalOpen(false);
    setAdvancedModalAgent(null);
  };

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

      const agentsResponse = await fetch(
        `/api/data/agents-by-owner/${address}`
      );
      const agentsData = await agentsResponse.json();
      setOwnedAgents(agentsData.agents || []);
    } catch (error) {
      setError(error);
    }
    setLoading(false);
  };

  const fetchFullAgent = async (agent) => {
    setEditError(null);
    try {
      const data = await createAuthenticatedRequest(
        `/api/breaker/full-agent/${agent._id}`,
        {
          method: "GET",
        }
      );

      localStorage.setItem("token", data.token);
      setAdvancedModalOpen(true);
      setAdvancedModalAgent(data.agent);
    } catch (error) {
      console.error(error);
      setEditError(error.response.data.error);
    }
  };

  const createAuthenticatedRequest = async (endpoint, options = {}) => {
    // First try using stored JWT
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      try {
        // Verify the token is still valid
        const verifyResponse = await fetch("/api/auth/verify-token", {
          headers: {
            Authorization: `Bearer ${storedToken}`,
            address: publicKey.toString(),
          },
        });

        if (verifyResponse.ok) {
          // Token is valid, use it for the request
          const response = await fetch(endpoint, {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${storedToken}`,
            },
          });

          if (!response.ok) {
            throw new Error(response.statusText);
          }

          return response.json();
        }
      } catch (error) {
        // Token verification failed, remove it
        localStorage.removeItem("token");
      }
    }

    // Fall back to Solana auth if no token or token invalid
    if (!connected || !publicKey || !wallet) {
      throw new Error("Wallet not connected");
    }

    try {
      // Create the message
      const message = `Authenticate with your wallet: ${Date.now()}`;
      const encodedMessage = new TextEncoder().encode(message);

      // Sign using the wallet adapter's signMessage method
      const signature = await wallet.adapter.signMessage(encodedMessage);

      // Add auth headers to the request
      const headers = {
        "Content-Type": "application/json",
        signature: bs58.encode(signature),
        publickey: publicKey.toString(),
        message: message,
        timestamp: Date.now().toString(),
        ...options.headers,
      };

      const response = await fetch(endpoint, {
        ...options,
        headers,
      });

      if (!response.ok) {
        setEditError(response.statusText);
      }

      return response.json();
    } catch (error) {
      console.error("Authentication error:", error);
      setEditError(error.message);
    }
  };

  if (error) {
    return (
      <div className="fullWidthPage">
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
    <Box
      sx={{ bgcolor: "#0A0A0A", minHeight: "100vh" }}
      className="fullWidthPage"
    >
      <Header />
      {loading ? (
        <PageLoader />
      ) : (
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Profile Card */}
          <Paper
            elevation={3}
            sx={{
              mb: 4,
              bgcolor: "transparent",
              // borderRadius: "16px",
              // border: "1px solid rgba(255, 255, 255, 0.05)",
            }}
          >
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {/* Profile Section */}
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "row", md: "column" },
                    alignItems: "center",
                    justifyContent: { xs: "flex-start", md: "center" },
                    gap: 2,
                    p: { xs: 2, sm: 3 },
                    bgcolor: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "12px",
                    border: "1px solid #0BBF99",
                    // height: "100%",
                    minHeight: { xs: "auto", md: "150px" },
                  }}
                >
                  <Avatar
                    sx={{
                      width: { xs: 60, sm: 80 },
                      height: { xs: 60, sm: 80 },
                      border: "4px solid #0BBF99",
                      bgcolor: "#1F1F2E",
                    }}
                  >
                    <Jdenticon value={address} size="80" />
                  </Avatar>
                  <Tooltip title={copied ? "Copied!" : "Copy address"}>
                    <IconButton
                      onClick={copyAddress}
                      sx={{
                        bgcolor: "#262636",
                        "&:hover": { bgcolor: "#303045" },
                        px: 2,
                        py: 1,
                        borderRadius: "8px",
                        width: { xs: "auto", md: "100%" },
                        maxWidth: "220px",
                      }}
                    >
                      {copied ? (
                        <FaCheckCircle color="#0BBF99" />
                      ) : (
                        <FaCopy color="#E0E0E0" />
                      )}
                      <Typography
                        variant="body2"
                        sx={{ ml: 1, color: "#E0E0E0" }}
                      >
                        {address.slice(0, 4)}...{address.slice(-4)}
                      </Typography>
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>

              {/* Stats Cards */}
              <Grid item xs={12} md={8}>
                <Grid
                  container
                  spacing={{ xs: 2, sm: 2 }}
                  sx={{
                    height: "100%",
                    "& .MuiGrid-item": {
                      display: "flex",
                    },
                  }}
                >
                  {[
                    {
                      icon: <GiReceiveMoney size={30} color="#0BBF99" />,
                      label: "Total Prize",
                      value: userStats.totalUsdPrize,
                      prefix: "$",
                    },
                    {
                      icon: <GiDiamondTrophy size={30} color="#FFD700" />,
                      label: "Total Wins",
                      value: userStats.totalWins,
                    },
                    {
                      icon: <GiBreakingChain size={30} color="#FF4081" />,
                      label: "Attempts",
                      value: chatCount,
                    },
                  ].map((stat, index) => (
                    <Grid
                      item
                      xs={4}
                      key={index}
                      sx={{ flex: 1, minWidth: { xs: "100px", sm: "200px" } }}
                    >
                      <Card
                        sx={{
                          height: "100%",
                          width: "100%",
                          bgcolor: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid #0BBF99",
                          borderRadius: "12px",
                          transition: "transform 0.2s",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          "&:hover": {
                            transform: "translateY(-4px)",
                          },
                        }}
                      >
                        <CardContent
                          sx={{
                            textAlign: "center",
                            p: { xs: 1.5, sm: 1.5 },
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                          }}
                        >
                          <Box sx={{ mb: { xs: 1, sm: 1 } }}>{stat.icon}</Box>
                          <Typography
                            variant="h6"
                            sx={{
                              color: "#E0E0E0",
                              mb: 1,
                              fontSize: { xs: "0.9rem", sm: "1.25rem" },
                            }}
                          >
                            {stat.label}
                          </Typography>
                          <Typography
                            variant="h5"
                            sx={{
                              color: "#0BBF99",
                              fontSize: { xs: "1.2rem", sm: "1.5rem" },
                            }}
                          >
                            <CountUp
                              end={stat.value}
                              start={0}
                              duration={2}
                              separator=","
                              prefix={stat.prefix}
                            />
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                padding: "20px 0px 0px",
              }}
            >
              <ApiKeyModal isOpen={isOpen} setIsOpen={setIsOpen} />
            </Box>
          </Paper>

          {/* Tabs */}
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{
              mb: 4,
              "& .MuiTabs-indicator": {
                backgroundColor: "#0BBF99",
              },
              "& .MuiTab-root": {
                color: "#808080",
                "&.Mui-selected": {
                  color: "#0BBF99",
                },
              },
            }}
          >
            <Tab
              className="pointer"
              icon={<FaComments />}
              label="Conversations"
              sx={{
                "&.Mui-selected": { color: "#0BBF99" },
                textTransform: "none",
                fontSize: "1rem",
              }}
            />
            <Tab
              className="pointer"
              icon={<FaRobot />}
              label="Owned Agents"
              sx={{
                "&.Mui-selected": { color: "#0BBF99" },
                textTransform: "none",
                fontSize: "1rem",
              }}
            />
          </Tabs>

          {/* Conversations Tab */}
          {tabValue === 0 && chatCount > 0 ? (
            <Box>
              {/* Scrollable Conversations List */}
              <Box
                sx={{
                  mb: 4,
                  overflow: "auto",
                  "&::-webkit-scrollbar": {
                    height: "8px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "#1F1F2E",
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "#0BBF99",
                    borderRadius: "4px",
                    "&:hover": {
                      background: "#0aa588",
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    pb: 1, // Space for scrollbar
                    minWidth: "min-content", // Ensures cards don't shrink
                  }}
                >
                  {conversations.map((conversation) => (
                    <Card
                      className="pointer"
                      key={conversation.name}
                      onClick={() => handleTabClick(conversation.name)}
                      sx={{
                        cursor: "pointer",
                        bgcolor:
                          activeChallenge === conversation.name
                            ? "#262636"
                            : "rgba(255, 255, 255, 0.05)",
                        borderRadius: "12px",
                        transition: "all 0.3s ease",
                        border: "1px solid #0BBF99",
                        minWidth: { xs: "fit-content", sm: "fit-content" },
                        flex: "0 0 auto",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          bgcolor: "#262636",
                        },
                      }}
                    >
                      <CardContent sx={{ p: 2.5 }} className="pointer">
                        <Box
                          className="pointer"
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Avatar
                            className="pointer"
                            src={conversation.pfp}
                            alt={conversation.name}
                            sx={{
                              width: 48,
                              height: 48,
                              border: "2px solid #0BBF99",
                            }}
                          />
                          <Typography
                            variant="h6"
                            sx={{ color: "#E0E0E0" }}
                            className="pointer"
                          >
                            {conversation.name}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Box>

              {/* Chat Messages */}
              {activeConversation && (
                <Paper
                  sx={{
                    p: 3,
                    bgcolor: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "12px",
                    border: "1px solid #0BBF99",
                  }}
                >
                  {activeConversation.conversations?.map((message, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        gap: 2,
                        mb: 2,
                        flexDirection:
                          message.role === "user" ? "row" : "row-reverse",
                      }}
                    >
                      <Avatar
                        sx={{
                          border: "2px solid #0BBF99",
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                        }}
                      >
                        {message.role === "user" ? (
                          <Jdenticon value={address} size="40" />
                        ) : (
                          <img
                            src={activeConversation.pfp}
                            alt={activeConversation.name}
                            width={40}
                            height={40}
                          />
                        )}
                      </Avatar>
                      <Paper
                        sx={{
                          p: 2,
                          maxWidth: "70%",
                          bgcolor:
                            message.role === "user" ? "#262636" : "black",
                          borderRadius: "12px",
                          color: "#E0E0E0",
                        }}
                      >
                        <Typography style={{ overflowWrap: "break-word" }}>
                          {message.content}
                        </Typography>
                      </Paper>
                    </Box>
                  ))}
                </Paper>
              )}
            </Box>
          ) : (
            tabValue === 0 && (
              <div
                className="flex justify-center items-center h-full"
                style={{ height: "50vh" }}
              >
                <h1 style={{ color: "white" }}>No conversations found</h1>
              </div>
            )
          )}

          {/* Owned Agents Tab */}
          {tabValue === 1 && ownedAgents.length > 0 ? (
            <>
              <div className="beta-agents-list desktop">
                {loading
                  ? [...Array(12)].map((_, index) => (
                      <AgentCardSkeleton index={index} key={index} />
                    ))
                  : ownedAgents?.map((agent, index) => (
                      <AgentCardAlt
                        key={agent.id || index}
                        agent={agent}
                        publicKey={publicKey}
                        connected={connected}
                        handleAdvancedModalOpen={handleAdvancedModalOpen}
                      />
                    ))}
              </div>

              <div className="beta-agents-list mobile">
                {loading
                  ? [...Array(12)].map((_, index) => (
                      <ChallengeItemSkeleton index={index} key={index} />
                    ))
                  : ownedAgents?.map((agent, index) => (
                      <ChallengeItem
                        key={agent.id || index}
                        challenge={agent}
                      />
                    ))}
              </div>
            </>
          ) : (
            tabValue === 1 && (
              <div
                className="flex justify-center items-center h-full"
                style={{ height: "50vh" }}
              >
                <h1 style={{ color: "white" }}>No agents found</h1>
              </div>
            )
          )}
        </Container>
      )}

      <Dialog
        open={editError}
        sx={{ zIndex: "999999999999999" }}
        PaperProps={{
          style: {
            backgroundColor: "#000000",
            color: "#fe3448",
            padding: "10px",
            borderRadius: "20px",
            border: "2px solid #fe3448",
            minWidth: "300px",
            textAlign: "center",
            position: "absolute",
            bottom: "10px",
            right: "20px",
            width: "100px",
          },
        }}
      >
        <DialogContent sx={{ position: "relative" }}>
          <IconButton
            className="close pointer"
            onClick={() => setEditError(null)}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              color: "#fe3448",
            }}
          >
            <ImCross size={16} />
          </IconButton>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <FaSadCry size={50} />
            <div style={{ fontSize: "18px", fontWeight: "bold" }}>
              {editError}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Footer />
    </Box>
  );
}
