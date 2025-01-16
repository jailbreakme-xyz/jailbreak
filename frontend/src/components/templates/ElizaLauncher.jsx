import React, { useState } from "react";
import { Transition } from "@headlessui/react";
import { FiUpload, FiCheck, FiAlertCircle } from "react-icons/fi";
import "../../styles/ElizaLauncher.css";

const ElizaLauncher = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/json") {
      setFile(droppedFile);
      setStatus({ type: "", message: "" });
    } else {
      setStatus({ type: "error", message: "Please upload a JSON file" });
    }
  };

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/json") {
      setFile(selectedFile);
      setStatus({ type: "", message: "" });
    } else {
      setStatus({ type: "error", message: "Please upload a JSON file" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("character", file);

    try {
      setStatus({ type: "loading", message: "Uploading character..." });
      const response = await fetch("/eliza/upload-character", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: "success",
          message: "Character uploaded successfully!",
        });
        setFile(null);
      } else {
        throw new Error(data.error || "Failed to upload character");
      }
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    }
  };

  return (
    <div className="uploader-container">
      <form onSubmit={handleSubmit} className="uploader-form">
        <div
          className={`drop-zone ${dragActive ? "active" : ""} ${
            file ? "has-file" : ""
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".json"
            onChange={handleFileInput}
            className="file-input"
          />

          <Transition
            show={true}
            enter="transition-all duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition-all duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="upload-content">
              <FiUpload className="upload-icon" />
              <h3 className="upload-title">
                {file
                  ? "File ready to upload"
                  : "Drop your character file here"}
              </h3>
              <p className="upload-subtitle">
                {file
                  ? file.name
                  : "Drag and drop your JSON file, or click to browse"}
              </p>
            </div>
          </Transition>

          <Transition
            show={!!file}
            enter="transition-all duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition-all duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="file-info">
              <FiCheck className="check-icon" />
            </div>
          </Transition>
        </div>

        <Transition
          show={!!status.message}
          enter="transition-all duration-300"
          enterFrom="opacity-0 transform -translate-y-2"
          enterTo="opacity-100 transform translate-y-0"
          leave="transition-all duration-200"
          leaveFrom="opacity-100 transform translate-y-0"
          leaveTo="opacity-0 transform -translate-y-2"
        >
          {status.message && (
            <div className={`status-message ${status.type}`}>
              {status.type === "error" && (
                <FiAlertCircle className="status-icon" />
              )}
              {status.type === "success" && <FiCheck className="status-icon" />}
              <span>{status.message}</span>
            </div>
          )}
        </Transition>

        <button
          type="submit"
          disabled={!file || status.type === "loading"}
          className={`submit-button ${
            !file || status.type === "loading" ? "disabled" : ""
          }`}
        >
          {status.type === "loading" ? "Uploading..." : "Upload Character"}
        </button>
      </form>
    </div>
  );
};

export default ElizaLauncher;
