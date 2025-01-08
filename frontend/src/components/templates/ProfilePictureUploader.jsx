import React, { useState, useEffect } from "react";
import { FileUploader } from "react-drag-drop-files";
import { styled } from "@mui/system";
import { BiSolidImageAdd } from "react-icons/bi";

const fileTypes = ["JPG", "JPEG", "PNG", "GIF"];

const ProfilePictureUploader = ({
  onFileChange,
  preview,
  sample,
  customColor,
  customFilter,
}) => {
  const [imagePreview, setImagePreview] = useState(sample);

  const CircleContainer = styled("div")({
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    border: `2px dashed ${customColor ? customColor : "#0BBF99"}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
    cursor: "pointer",
  });

  const Image = styled("img")({
    width: "100%",
    height: "100%",
    objectFit: "cover",
    position: "absolute",
    top: 0,
    left: 0,
  });

  const IconContainer = styled("div")({
    position: "absolute",
    zIndex: 1,
    color: customColor ? customColor : "#0BBF99",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  });

  const handleFileChange = (file) => {
    if (!file) return;
    const reader = new FileReader();

    reader.onloadend = () => {
      if (reader.error) {
        console.error("Error reading file:", reader.error);
        return;
      }
      setImagePreview(reader.result);
      onFileChange(file);
    };

    reader.onerror = (error) => {
      console.error("FileReader error:", error);
    };

    reader.readAsDataURL(file);
  };

  const Overlay = styled("div")({
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    color: "white",
    textAlign: "center",
    padding: "5px 0",
    fontSize: "12px",
  });

  useEffect(() => {
    if (preview) {
      setImagePreview(preview);
    }
  }, [preview]);

  return (
    <CircleContainer
      className="pointer pfp-container"
      onClick={() =>
        document.getElementsByClassName("file-uploader")[0].click()
      }
    >
      {imagePreview ? (
        <>
          <img
            src={imagePreview}
            alt="Profile Preview"
            className="pointer"
            style={{
              width: "90px",
              height: "90px",
              objectFit: "cover",
              filter: customFilter ? customFilter : "none",
            }}
          />

          <Overlay className="pointer">Upload</Overlay>
        </>
      ) : (
        <IconContainer className="pointer">
          <BiSolidImageAdd size={30} className="pointer" />
        </IconContainer>
      )}
      <FileUploader
        classes="file-uploader"
        handleChange={handleFileChange}
        name="file"
        types={fileTypes}
        style={{ display: "none" }}
      />
    </CircleContainer>
  );
};

export default ProfilePictureUploader;
