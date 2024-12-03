"use client";
import React, { useState } from "react";
import {
  FaHome,
  FaUsers,
  FaTelegramPlane,
  FaCode,
  FaQuestionCircle,
  FaChevronCircleRight,
} from "react-icons/fa";

import "../../styles/Chat.css";
import Link from "next/link";
import { SiGitbook, SiGithub } from "react-icons/si";
import { FaXTwitter } from "react-icons/fa6";
import { GiBreakingChain } from "react-icons/gi";

const MainMenu = () => {
  return (
    <div className="mainMenu desktopMenu">
      <>
        <Link href="/" className="chatMainMenuItem pointer">
          <FaHome size={25} /> HOME
        </Link>
        <Link
          href="/challenge/67464991a95c1b426ef3920d"
          className="chatMainMenuItem pointer"
        >
          <GiBreakingChain size={25} /> BREAK
        </Link>
        <Link href="/docs" className="chatMainMenuItem pointer">
          <FaCode size={25} /> API
        </Link>
        <Link href="/faq" className="chatMainMenuItem pointer">
          <FaQuestionCircle size={25} /> FAQ
        </Link>
        <div className="chatMainMenuItem chatPageSocialMenu">
          <span className="">
            <FaUsers size={25} /> LINKS
          </span>
          <hr />
          <div className="chatPageSocialIcons">
            <a
              href="https://twitter.com/jailbreakme_xyz"
              target="_blank"
              className="pointer"
            >
              <FaXTwitter size={30} className="pointer" />
            </a>
            <a
              href="https://t.me/jailbreakme_xyz"
              target="_blank"
              className="pointer"
            >
              <FaTelegramPlane size={30} className="pointer" />
            </a>
            <a
              href="https://jailbreak.gitbook.io/jailbreakme.xyz"
              target="_blank"
              className="pointer"
            >
              <SiGitbook size={30} className="pointer" />
            </a>
            <a
              href="https://github.com/probonodev/jailbreak"
              target="_blank"
              className="pointer"
            >
              <SiGithub size={30} className="pointer" />
            </a>
          </div>
        </div>
        {/* <button
          id="comingSoonButton"
          className="styledBtn grayed disabled"
          style={{
            border: "0px",
            borderRadius: "5px",
            width: "100%",
            display: "grid",
          }}
        >
          <span>
            Create Tournament <FaChevronCircleRight />
          </span>
          <span>(Coming Soon)</span>
        </button> */}
      </>
    </div>
  );
};

export default MainMenu;
