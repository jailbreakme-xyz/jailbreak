"use client";
import React, { useEffect, useState } from "react";
import Footer from "../components/templates/Footer";
import Header from "../components/templates/Header";
import PageLoader from "../components/templates/PageLoader";
import AgentCardAlt from "../components/templates/AgentCardAlt";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FiFilter, FiChevronDown } from "react-icons/fi";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import axios from "axios";
import ChallengeItem from "../components/templates/ChallengeItem";
import { FaSadCry } from "react-icons/fa";
import {
  AgentCardSkeleton,
  ChallengeItemSkeleton,
} from "../components/templates/Skeleton";

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  // Filter and sort states
  const [verified, setVerified] = useState("all");
  const [status, setStatus] = useState("$type");
  const [sort, setSort] = useState("start_date_desc");
  const [showFilters, setShowFilters] = useState(true);

  const sortOptions = [
    { value: "usd_prize_desc", label: "💰 Highest Prize" },
    { value: "usd_prize_asc", label: "🪙 Lowest Prize" },
    { value: "entryFee_desc", label: "💵 Highest Entry Fee" },
    { value: "entryFee_asc", label: "💸 Lowest Entry Fee" },
    { value: "start_date_desc", label: "🆕 Newest First" },
    { value: "start_date_asc", label: "📅 Oldest First" },
    { value: "expiry_desc", label: "⏰ Expiring Soon" },
    { value: "attempts_desc", label: "🔥 Most Attempted" },
    { value: "attempts_asc", label: "🌱 Least Attempted" },
  ];

  const statusOptions = [
    { value: "$type", label: "📋 All" },
    { value: "active", label: "✅ Active" },
    { value: "upcoming", label: "🔜 Upcoming" },
    { value: "concluded", label: "🏁 Concluded" },
  ];

  const verifiedOptions = [
    { value: "all", label: "🤖 All Agents" },
    { value: "verified", label: "✨ Verified Bug Bounties" },
  ];

  const fetchAgents = async (resetList = false) => {
    try {
      if (resetList) {
        setLoading(true);
        setCursor(null);
      } else {
        setLoadingMore(true);
      }

      const response = await axios.get("/api/data/agents", {
        params: {
          verified,
          status,
          sort,
          cursor: resetList ? null : cursor,
          limit: 100,
        },
      });

      const { challenges, nextCursor, hasMore: more } = response.data;

      setAgents((prev) => (resetList ? challenges : [...prev, ...challenges]));
      setCursor(nextCursor);
      setHasMore(more);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchAgents(true);
  }, [status, sort, verified]);

  return (
    <div className="fullWidthPage">
      <Header />
      <div className="beta-container">
        <div className="filters-header">
          <h1>JailbreakMe Agents 🤖</h1>
          <button
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter /> Filters{" "}
            <FiChevronDown
              className={`transition-transform duration-200 ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        <div
          className={`filters-panel transition-all duration-300 ${
            showFilters
              ? "max-h-96 opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <FormControl className="filter-group pointer">
            <InputLabel>Type</InputLabel>
            <Select
              value={verified}
              onChange={(e) => setVerified(e.target.value)}
              label="Type"
            >
              {verifiedOptions.map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                  className="pointer"
                >
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl className="filter-group pointer">
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              label="Status"
            >
              {statusOptions.map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                  className="pointer"
                >
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl className="filter-group pointer">
            <InputLabel>Sort by</InputLabel>
            <Select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              label="Sort by"
            >
              {sortOptions.map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                  className="pointer"
                >
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <hr />

        {error && !loading && !agents.length && (
          <div className="error-message">Error loading agents: {error}</div>
        )}

        {!loading && agents.length === 0 && (
          <div className="no-results">
            <FaSadCry size={66} />
            <h2>No agents found</h2>
            <p>Try adjusting your filters to see more results</p>
          </div>
        )}

        <div className="beta-agents-list desktop">
          {loading
            ? [...Array(12)].map((_, index) => (
                <AgentCardSkeleton index={index} key={index} />
              ))
            : agents?.map((agent, index) => (
                <AgentCardAlt key={agent.id || index} agent={agent} />
              ))}
        </div>

        <div className="beta-agents-list mobile">
          {loading
            ? [...Array(12)].map((_, index) => (
                <ChallengeItemSkeleton index={index} key={index} />
              ))
            : agents?.map((agent, index) => (
                <ChallengeItem key={agent.id || index} challenge={agent} />
              ))}
        </div>

        {hasMore && !loading && (
          <div className="load-more-container">
            <button
              className="beta-breaker-load-more pointer"
              onClick={() => fetchAgents(false)}
              disabled={loadingMore}
            >
              {loadingMore ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
