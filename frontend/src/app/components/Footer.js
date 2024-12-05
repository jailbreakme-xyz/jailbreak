import React from "react";

export default function Footer(props) {
  return (
    <div style={{ width: "100%" }}>
      {props.status !== "concluded" ? (
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
      ) : (
        <div style={{ width: "100%" }}>
          <p style={{ color: "black" }}>
            🥳 This tournament has concluded. See you next time!
          </p>
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
      )}
    </div>
  );
}
