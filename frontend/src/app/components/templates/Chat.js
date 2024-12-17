"use client";
import React from "react";
import useChatStream from "@magicul/react-chat-stream";

function Chat({ apiUrl }) {
  const { messages, input, handleInputChange, handleSubmit } = useChatStream({
    options: {
      url: apiUrl,
      method: "POST",
    },
    method: {
      type: "body",
      key: "prompt",
    },
  });

  return (
    <div className="conversationSection">
      <div className="chat-container">
        {messages.map((message) => (
          <div key={message.id} className={`chat-bubble ${message.role}`}>
            <p>
              {message.role}: {message.content}
            </p>
          </div>
        ))}
        <form onSubmit={handleSubmit}>
          <input type="text" onChange={handleInputChange} value={input} />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}

export default Chat;
