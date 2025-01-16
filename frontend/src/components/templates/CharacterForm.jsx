import React, { useState } from "react";
import { Listbox, Switch, Transition } from "@headlessui/react";
import { FiPlus, FiMinus, FiSave, FiChevronDown } from "react-icons/fi";
import "../../styles/CharacterForm.css";

const MODEL_PROVIDERS = [
  { id: 1, name: "openai", label: "OpenAI" },
  { id: 2, name: "anthropic", label: "Anthropic" },
];

const VOICE_MODELS = [
  { id: 1, name: "en_US-hfc_female-medium", label: "US Female (Medium)" },
  { id: 2, name: "en_US-hfc_male-medium", label: "US Male (Medium)" },
];

const CLIENTS = [
  { id: 1, name: "direct", label: "Direct" },
  { id: 2, name: "twitter", label: "Twitter" },
  { id: 3, name: "discord", label: "Discord" },
];

const CharacterForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    clients: ["direct"],
    modelProvider: MODEL_PROVIDERS[0],
    settings: {
      secrets: {
        OPENAI_API_KEY: "",
      },
      voice: {
        model: VOICE_MODELS[0],
      },
    },
    people: [""],
    plugins: [""],
    bio: [""],
    lore: [""],
    knowledge: [""],
    messageExamples: [""],
    topics: [""],
    adjectives: [""],
    style: {
      chat: [""],
    },
  });

  const [enableVoice, setEnableVoice] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/eliza/upload-character", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Handle success
      } else {
        // Handle error
      }
    } catch (error) {
      console.error("Error submitting character:", error);
    }
  };

  const handleArrayAdd = (field) => {
    setFormData((prev) => {
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: [...prev[parent][child], ""],
          },
        };
      }
      return {
        ...prev,
        [field]: [...prev[field], ""],
      };
    });
  };

  const handleArrayRemove = (field, index) => {
    setFormData((prev) => {
      const array = field.includes(".")
        ? prev[field.split(".")[0]][field.split(".")[1]]
        : prev[field];

      // Don't remove if it's the last item
      if (array.length <= 1) return prev;

      if (field.includes(".")) {
        return {
          ...prev,
          [field.split(".")[0]]: {
            ...prev[field.split(".")[0]],
            [field.split(".")[1]]: array.filter((_, i) => i !== index),
          },
        };
      }

      return {
        ...prev,
        [field]: array.filter((_, i) => i !== index),
      };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="character-form">
      {/* Basic Configuration Group */}
      <div className="section-group">
        <h2 className="section-group-title">Basic Configuration</h2>
        <div className="form-row">
          <div className="form-col">
            <div className="form-group">
              <label className="form-label">Character Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="form-input"
                placeholder="Enter character name"
              />
            </div>
          </div>
          <div className="form-col">
            <div className="form-group">
              <label className="form-label">Model Provider</label>
              <Listbox
                value={formData.modelProvider}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, modelProvider: value }))
                }
              >
                <div className="listbox-container">
                  <Listbox.Button className="listbox-button">
                    <span>{formData.modelProvider.label}</span>
                    <FiChevronDown className="listbox-icon" />
                  </Listbox.Button>
                  <Transition
                    enter="transition duration-100 ease-out"
                    enterFrom="transform scale-95 opacity-0"
                    enterTo="transform scale-100 opacity-100"
                    leave="transition duration-75 ease-out"
                    leaveFrom="transform scale-100 opacity-100"
                    leaveTo="transform scale-95 opacity-0"
                  >
                    <Listbox.Options className="listbox-options">
                      {MODEL_PROVIDERS.map((provider) => (
                        <Listbox.Option
                          key={provider.id}
                          value={provider}
                          className={({ active }) =>
                            `listbox-option ${active ? "active" : ""}`
                          }
                        >
                          {({ selected }) => (
                            <span className={selected ? "selected" : ""}>
                              {provider.label}
                            </span>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-col">
            <div className="form-group">
              <label className="form-label">OpenAI API Key</label>
              <input
                type="password"
                value={formData.settings.secrets.OPENAI_API_KEY}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      secrets: {
                        ...prev.settings.secrets,
                        OPENAI_API_KEY: e.target.value,
                      },
                    },
                  }))
                }
                className="form-input"
                placeholder="Enter your OpenAI API key"
              />
            </div>
          </div>
          <div className="form-col">
            <div className="form-group">
              <label className="form-label">Voice Model</label>
              <Listbox
                value={formData.settings.voice.model}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      voice: { ...prev.settings.voice, model: value },
                    },
                  }))
                }
              >
                <div className="listbox-container">
                  <Listbox.Button className="listbox-button">
                    <span>{formData.settings.voice.model.label}</span>
                    <FiChevronDown className="listbox-icon" />
                  </Listbox.Button>
                  <Transition
                    enter="transition duration-100 ease-out"
                    enterFrom="transform scale-95 opacity-0"
                    enterTo="transform scale-100 opacity-100"
                    leave="transition duration-75 ease-out"
                    leaveFrom="transform scale-100 opacity-100"
                    leaveTo="transform scale-95 opacity-0"
                  >
                    <Listbox.Options className="listbox-options">
                      {VOICE_MODELS.map((model) => (
                        <Listbox.Option
                          key={model.id}
                          value={model}
                          className={({ active }) =>
                            `listbox-option ${active ? "active" : ""}`
                          }
                        >
                          {({ selected }) => (
                            <span className={selected ? "selected" : ""}>
                              {model.label}
                            </span>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>
          </div>
        </div>
      </div>

      {/* Character Traits Group */}
      <div className="section-group">
        <h2 className="section-group-title">Character Traits</h2>
        <div className="form-grid">
          {/* Topics Section */}
          <div className="form-section half-width">
            <h3 className="section-title">Topics</h3>
            {formData.topics.map((item, index) => (
              <div key={index} className="array-item">
                <input
                  type="text"
                  value={item}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      topics: prev.topics.map((t, i) =>
                        i === index ? e.target.value : t
                      ),
                    }))
                  }
                  className="form-input"
                  placeholder="Enter topic..."
                />
                {formData.topics.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleArrayRemove("topics", index)}
                    className="btn-icon"
                  >
                    <FiMinus />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleArrayAdd("topics")}
              className="btn-add"
            >
              <FiPlus /> Add Topic
            </button>
          </div>

          {/* Adjectives Section */}
          <div className="form-section half-width">
            <h3 className="section-title">Adjectives</h3>
            {formData.adjectives.map((item, index) => (
              <div key={index} className="array-item">
                <input
                  type="text"
                  value={item}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      adjectives: prev.adjectives.map((a, i) =>
                        i === index ? e.target.value : a
                      ),
                    }))
                  }
                  className="form-input"
                  placeholder="Enter adjective..."
                />
                {formData.adjectives.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleArrayRemove("adjectives", index)}
                    className="btn-icon"
                  >
                    <FiMinus />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleArrayAdd("adjectives")}
              className="btn-add"
            >
              <FiPlus /> Add Adjective
            </button>
          </div>
        </div>
      </div>

      {/* Character Details Group */}
      <div className="section-group">
        <h2 className="section-group-title">Character Details</h2>
        <div className="form-grid">
          {/* Bio Section */}
          <div className="form-section">
            <h3 className="section-title">Biography</h3>
            {formData.bio.map((item, index) => (
              <div key={index} className="array-item">
                <textarea
                  value={item}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      bio: prev.bio.map((bio, i) =>
                        i === index ? e.target.value : bio
                      ),
                    }))
                  }
                  className="form-textarea"
                  placeholder="Enter biography details..."
                />
                <button
                  type="button"
                  onClick={() => handleArrayRemove("bio", index)}
                  className="btn-icon"
                >
                  <FiMinus />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleArrayAdd("bio")}
              className="btn-add"
            >
              <FiPlus /> Add Bio Entry
            </button>
          </div>
        </div>
        <div className="form-grid">
          {/* Lore Section */}
          <div className="form-section">
            <h3 className="section-title">Lore</h3>
            {formData.lore.map((item, index) => (
              <div key={index} className="array-item">
                <textarea
                  value={item}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lore: prev.lore.map((l, i) =>
                        i === index ? e.target.value : l
                      ),
                    }))
                  }
                  className="form-textarea"
                  placeholder="Enter lore details..."
                />
                {formData.lore.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleArrayRemove("lore", index)}
                    className="btn-icon"
                  >
                    <FiMinus />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleArrayAdd("lore")}
              className="btn-add"
            >
              <FiPlus /> Add Lore Entry
            </button>
          </div>
        </div>
      </div>

      {/* Communication Style Group */}
      <div className="section-group">
        <h2 className="section-group-title">Communication Style</h2>
        <div className="form-grid">
          {/* Message Examples Section */}
          <div className="form-section half-width">
            <h3 className="section-title">Message Examples</h3>
            {formData.messageExamples.map((item, index) => (
              <div key={index} className="array-item">
                <input
                  type="text"
                  value={item}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      messageExamples: prev.messageExamples.map((m, i) =>
                        i === index ? e.target.value : m
                      ),
                    }))
                  }
                  className="form-input"
                  placeholder="Enter message example..."
                />
                {formData.messageExamples.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleArrayRemove("messageExamples", index)}
                    className="btn-icon"
                  >
                    <FiMinus />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleArrayAdd("messageExamples")}
              className="btn-add"
            >
              <FiPlus /> Add Message Example
            </button>
          </div>

          {/* Style Section */}
          <div className="form-section half-width">
            <h3 className="section-title">Chat Style</h3>
            <div className="form-group">
              {formData.style.chat.map((item, index) => (
                <div key={index} className="array-item">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        style: {
                          ...prev.style,
                          chat: prev.style.chat.map((c, i) =>
                            i === index ? e.target.value : c
                          ),
                        },
                      }))
                    }
                    className="form-input"
                    placeholder="Enter chat style..."
                  />
                  {formData.style.chat.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleArrayRemove("style.chat", index)}
                      className="btn-icon"
                    >
                      <FiMinus />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleArrayAdd("style.chat")}
                className="btn-add"
              >
                <FiPlus /> Add Chat Style
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information Group */}
      <div className="section-group">
        <h2 className="section-group-title">Additional Information</h2>
        <div className="form-grid">
          {/* Knowledge Section */}
          <div className="form-section">
            <h3 className="section-title">Knowledge</h3>
            {formData.knowledge.map((item, index) => (
              <div key={index} className="array-item">
                <textarea
                  value={item}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      knowledge: prev.knowledge.map((k, i) =>
                        i === index ? e.target.value : k
                      ),
                    }))
                  }
                  className="form-textarea"
                  placeholder="Enter knowledge entry..."
                />
                {formData.knowledge.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleArrayRemove("knowledge", index)}
                    className="btn-icon"
                  >
                    <FiMinus />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleArrayAdd("knowledge")}
              className="btn-add"
            >
              <FiPlus /> Add Knowledge Entry
            </button>
          </div>
        </div>
      </div>

      {/* Additional Information Group */}
      <div className="section-group">
        <h2 className="section-group-title">Additional Information</h2>
        <div className="form-grid">
          {/* People & Plugins */}
          <div className="form-section half-width">
            <div className="form-group">
              <h3 className="section-title">People</h3>
              {formData.people.map((item, index) => (
                <div key={index} className="array-item">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        people: prev.people.map((p, i) =>
                          i === index ? e.target.value : p
                        ),
                      }))
                    }
                    className="form-input"
                    placeholder="Enter person..."
                  />
                  {formData.people.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleArrayRemove("people", index)}
                      className="btn-icon"
                    >
                      <FiMinus />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleArrayAdd("people")}
                className="btn-add"
              >
                <FiPlus /> Add Person
              </button>
            </div>
          </div>
          <div className="form-section half-width">
            <div className="form-group">
              <h3 className="section-title">Plugins</h3>
              {formData.plugins.map((item, index) => (
                <div key={index} className="array-item">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        plugins: prev.plugins.map((p, i) =>
                          i === index ? e.target.value : p
                        ),
                      }))
                    }
                    className="form-input"
                    placeholder="Enter plugin..."
                  />
                  {formData.plugins.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleArrayRemove("plugins", index)}
                      className="btn-icon"
                    >
                      <FiMinus />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleArrayAdd("plugins")}
                className="btn-add"
              >
                <FiPlus /> Add Plugin
              </button>
            </div>
          </div>
        </div>
      </div>

      <button type="submit" className="btn-submit">
        <FiSave /> Save Character
      </button>
    </form>
  );
};

export default CharacterForm;
