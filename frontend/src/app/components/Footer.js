import React from "react";
import Timer from "./partials/Timer";
export default function Footer(props) {
  return (
    <div style={{ width: "100%" }}>
      {props.status === "active" ? (
        <form
          onSubmit={props.submit}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <textarea
            style={{
              fontSize: "16px",
              height: "48px",
              overflowY: "auto",
              overflowX: "hidden",
              resize: "none",
              verticalAlign: "middle",
              boxSizing: "border-box",
              padding: "8px 12px",
              margin: 0,
              flex: 1,
            }}
            minLength={1}
            maxLength={4000}
            value={props.value}
            onChange={props.onChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                props.submit(e);
              }
            }}
            placeholder={
              props.task ? `${props.task}...` : "Jailbreak this prompt..."
            }
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "48px",
              margin: 0,
            }}
          >
            {props.button}
          </div>
        </form>
      ) : props.status === "concluded" ? (
        <div style={{ width: "100%" }}>
          <h3 style={{ color: "black" }}>
            🥳 This tournament has concluded.
            <br />
            See you next time!
          </h3>
          <p style={{ color: "black" }}>
            Stay tuned for the next tournament! 🚀{" "}
            <a
              href="https://x.com/jailbreakme_xyz"
              target="_blank"
              rel="noreferrer"
              className="pointer"
            >
              @jailbreakme_xyz
            </a>
          </p>
        </div>
      ) : (
        <div style={{ width: "100%" }}>
          <h3 style={{ color: "black" }}>Tournament starts in</h3>
          <div className="upcoming-timer">
            <Timer expiryDate={props.start_date} />
          </div>
        </div>
      )}
    </div>
  );
}
