import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay, Navigation, FreeMode } from "swiper/modules";
import { RiVerifiedBadgeFill } from "react-icons/ri";
const numbersWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export default function TrendingAgentsCarousel({ agents }) {
  if (!agents?.length) return null;

  const getStatusClass = (status) => {
    return status === "active"
      ? "live"
      : status === "upcoming"
      ? "upcoming"
      : "inactive";
  };

  const getStatusText = (status) => {
    return status === "active" ? "LIVE" : status;
  };

  const getPrizeLevel = (prize) => {
    if (prize >= 10000) return "legendary";
    if (prize >= 5000) return "epic";
    if (prize >= 1000) return "rare";
    if (prize >= 500) return "uncommon";
    return "common";
  };

  return (
    <div className="trending-agents-section">
      <h2 style={{ margin: "0px" }}>🤖 Trending Agents</h2>
      <Link
        className="beta-breakers-view-all pointer"
        to="/agents"
        style={{
          margin: "5px 0px",
          fontSize: "14px",
          color: "#666",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          transition: "color 0.2s ease",
          fontWeight: "500",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#0BBF99")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
      >
        View All <span style={{ marginLeft: "4px" }}>→</span>
      </Link>
      <div className="trending-agents-wrapper">
        <div className="trending-agents-container">
          <Swiper
            modules={[FreeMode, Navigation, Autoplay]}
            spaceBetween={30}
            slidesPerView={3}
            freeMode={{
              enabled: true,
            }}
            autoplay={{
              delay: 2000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            navigation
            loop={true}
            breakpoints={{
              // Responsive breakpoints
              320: {
                slidesPerView: 2,
                spaceBetween: 10,
              },
              640: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 10,
              },
            }}
          >
            {agents.map((agent, index) => (
              <SwiperSlide
                key={`${agent.name}-${index}`}
                className="trending-agent-card pointer"
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Link
                  to={`/break/${agent.name}`}
                  className="pointer"
                  style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div className="trending-agent-image-container pointer">
                    <img
                      src={agent.pfp}
                      alt={agent.name}
                      className="trending-agent-image pointer"
                    />
                    <div
                      className={`status-indicator pointer ${getStatusClass(
                        agent.status
                      )}`}
                    >
                      {getStatusText(agent.status)}
                    </div>
                    <div
                      className="prize-overlay"
                      data-prize-tier={getPrizeLevel(agent.usd_prize)}
                    >
                      ${numbersWithCommas(agent.usd_prize.toFixed(2))}
                    </div>
                  </div>
                  <div className="trending-agent-content">
                    <div>
                      <h3
                        className="pointer"
                        style={{ color: "white", marginBottom: "4px" }}
                      >
                        {agent.name}
                      </h3>
                      {agent.verified_owner?.name && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            fontSize: "0.8em",
                            color: "#0BBF99",
                            marginBottom: "8px",
                          }}
                        >
                          <RiVerifiedBadgeFill
                            style={{
                              marginRight: "4px",
                              verticalAlign: "middle",
                            }}
                          />
                          {agent.verified_owner?.link ? (
                            <span
                              className="pointer"
                              style={{
                                color: "#0BBF99",
                                textDecoration: "none",
                              }}
                            >
                              {agent.verified_owner?.name}
                            </span>
                          ) : (
                            <span>{agent.verified_owner?.name}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="trending-agent-stats">
                      <div className="stat-item">
                        <span className="stat-label">Entry Fee</span>
                        <span className="stat-value">
                          {agent.entryFee?.toFixed(3)} SOL
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Break Attempts</span>
                        <span className="stat-value">
                          {numbersWithCommas(agent.break_attempts)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
}
