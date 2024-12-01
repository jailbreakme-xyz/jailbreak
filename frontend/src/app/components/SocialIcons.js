import React from "react";
import { FaTelegramPlane } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { SiGitbook, SiGithub } from "react-icons/si";

export default function SocialIcons() {
  return (
    <div className="socialIcons">
      <a
        href="https://twitter.com/jailbreakme_xyz"
        target="_blank"
        className="pointer"
      >
        <FaXTwitter size={30} className="pointer" />
      </a>
      <a
        href="https://t.me/+-MZ4uveXh2swZmFk"
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
  );
}
