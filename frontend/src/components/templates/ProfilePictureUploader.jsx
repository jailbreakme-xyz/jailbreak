import React, { useState, useEffect, memo, useRef, useCallback } from "react";
// import { FileUploader } from "react-drag-drop-files";
import { styled } from "@mui/system";
import { BiSolidImageAdd } from "react-icons/bi";

const fileTypes = ["JPG", "JPEG", "PNG", "GIF"];

const MemoizedImage = memo(
  ({ src, customFilter, customWidth, customHeight }) => (
    <img
      src={src}
      alt="Profile Preview"
      className="pointer"
      style={{
        width: customWidth ? customWidth : "90px",
        height: customHeight ? customHeight : "90px",
        objectFit: "cover",
        filter: customFilter ? customFilter : "none",
      }}
    />
  )
);

const ProfilePictureUploader = ({
  onFileChange,
  preview,
  sample,
  customColor,
  customFilter,
  isUploading,
  customWidth,
  customHeight,
}) => {
  const [imagePreview, setImagePreview] = useState(sample);
  const fileUploaderRef = useRef(null);

  // const FileUploader = memo(({ onFileChange }) => (
  //   <input
  //     ref={fileUploaderRef}
  //     type="file"
  //     accept="image/jpeg,image/jpg,image/png,image/gif"
  //     onChange={(e) => onFileChange(e.target.files[0])}
  //     style={{ display: "none" }}
  //   />
  // ));

  const CircleContainer = styled("div")({
    width: customWidth ? customWidth : "90px",
    height: customHeight ? customHeight : "90px",
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

    isUploading.current = true;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.error) {
        console.error("Error reading file:", reader.error);
        isUploading.current = false;
        return;
      }
      setImagePreview(reader.result);
      onFileChange(file);
    };

    reader.onerror = (error) => {
      console.error("FileReader error:", error);
      isUploading.current = false;
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
    <CircleContainer className="pointer pfp-container">
      <input
        ref={fileUploaderRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif"
        onChange={(e) => {
          handleFileChange(e.target.files[0]);
        }}
        style={{ display: "none" }}
      />
      {/* <FileUploader onFileChange={handleFileChange} /> */}

      <div
        onClick={() => {
          isUploading.current = true;
          fileUploaderRef.current?.click();
        }}
      >
        {imagePreview ? (
          <>
            <MemoizedImage
              src={imagePreview}
              customFilter={customFilter}
              customWidth={customWidth}
              customHeight={customHeight}
            />
            <Overlay className="pointer">Upload</Overlay>
          </>
        ) : (
          <IconContainer className="pointer">
            <BiSolidImageAdd size={30} className="pointer" />
          </IconContainer>
        )}
      </div>
      {/* <FileUploader
        classes="file-uploader"
        handleChange={handleFileChange}
        name="file"
        types={fileTypes}
        style={{ display: "none" }}
      /> */}
    </CircleContainer>
  );
};

export default ProfilePictureUploader;
