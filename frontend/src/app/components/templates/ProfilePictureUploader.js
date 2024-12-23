import React, { useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { styled } from "@mui/system";
import { BiSolidImageAdd } from "react-icons/bi";

const fileTypes = ["JPG", "JPEG", "PNG", "GIF"];

const CircleContainer = styled("div")({
  width: "90px",
  height: "90px",
  borderRadius: "50%",
  border: "2px dashed #0BBF99",
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
  color: "#0BBF99",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const ProfilePictureUploader = ({ onFileChange }) => {
  const [imagePreview, setImagePreview] = useState(
    "https://storage.googleapis.com/jailbreakme-images/claraProfile.jpg"
  );

  const handleFileChange = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      onFileChange(file);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
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
            style={{ width: "90px", height: "90px", objectFit: "cover" }}
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
