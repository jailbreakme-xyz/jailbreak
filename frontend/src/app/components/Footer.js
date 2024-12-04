import React from "react";

export default function Footer(props) {
  return (
    <div style={{ width: "100%" }}>
      {props.status !== "concluded" ? (
        <form
          onSubmit={props.submit}
          style={{
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          <textarea
            style={{
              fontSize: "16px",
              height: "1.5em",
              overflowY: "auto",
              overflowX: "hidden",
              resize: "none",
            }}
            minLength={1}
            maxLength={4000}
            value={props.value}
            onChange={props.onChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault(); // Prevent default Enter behavior
                props.submit(e); // Call the submit function
              }
            }}
            placeholder={
              props.task ? `${props.task}...` : "Jailbreak this prompt..."
            }
          />
          {props.button}
        </form>
      ) : (
        <div style={{ width: "100%" }}>
          <p style={{ color: "black" }}>
            🥳 This tournament has concluded. See you next time!
          </p>
        </div>
      )}
    </div>
  );
}
