import React, { useState, useRef } from "react";
import { Tab } from "@headlessui/react";
import ElizaLauncher from "../components/templates/ElizaLauncher";
import CharacterForm from "../components/templates/CharacterForm";
import Header from "../components/templates/Header";
import "../styles/CreateCharacterPage.css";
import elizaLogo from "../assets/eliza.jpg";
import ProfilePictureUploader from "../components/templates/ProfilePictureUploader";

const CreateCharacterPage = () => {
  const [formData, setFormData] = useState({});
  const [imagePreview, setImagePreview] = useState(elizaLogo);
  const isUploading = useRef(false);

  const handleImageChange = (file) => {
    setFormData((prev) => ({
      ...prev,
      pfp: file,
    }));
  };

  return (
    <div className="create-character-page fullWidthPage">
      <Header />
      <div className="page-content">
        <div className="profile-picture-uploader-container">
          <ProfilePictureUploader
            customWidth="100px"
            customHeight="100px"
            isUploading={isUploading}
            preview={imagePreview}
            onFileChange={handleImageChange}
          />
        </div>
        <h1 className="page-title" style={{ marginTop: "10px" }}>
          Create New Character
        </h1>

        <Tab.Group>
          <Tab.List className="tabs-container">
            <div className="tabs-list">
              <Tab
                className={({ selected }) => `tab ${selected ? "active" : ""}`}
              >
                JSON Upload
              </Tab>
              <Tab
                className={({ selected }) => `tab ${selected ? "active" : ""}`}
              >
                Form Builder
              </Tab>
            </div>
          </Tab.List>

          <Tab.Panels className="tab-panels">
            <Tab.Panel className="tab-panel">
              <ElizaLauncher />
            </Tab.Panel>
            <Tab.Panel className="tab-panel">
              <CharacterForm />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default CreateCharacterPage;
