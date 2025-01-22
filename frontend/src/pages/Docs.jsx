import React, { useState, useEffect, useRef } from "react";
import { Tab } from "@headlessui/react";
import {
  FaCog,
  FaRobot,
  FaBook,
  FaGlobe,
  FaTrophy,
  FaLock,
  FaComments,
  FaGamepad,
  FaCode,
  FaDatabase,
  FaUserSecret,
  FaShieldAlt,
} from "react-icons/fa";
import { FaWandMagicSparkles } from "react-icons/fa6";
import Header from "../components/templates/Header";
import Footer from "../components/templates/Footer";
import styled from "@emotion/styled";
import mermaid from "mermaid";

// Initialize Mermaid with specific configuration
mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  securityLevel: "loose",
  fontFamily: "monospace",
});

const Container = styled.main({
  maxWidth: "1400px",
  margin: "0 auto",
  padding: "40px 24px",
  color: "#ffffff",
  display: "grid",
  gridTemplateColumns: "280px 1fr",
  gap: "40px",
  "@media (max-width: 1024px)": {
    gridTemplateColumns: "1fr",
  },
});

const Sidebar = styled.nav({
  position: "sticky",
  // top: "100px",
  height: "fit-content",
  backgroundColor: "#1a1a1a",
  borderRadius: "12px",
  padding: "24px",
  border: "2px solid #2a2a2a",
  "@media (max-width: 1024px)": {
    position: "relative",
    top: 0,
  },
});

const SidebarSection = styled.div({
  marginBottom: "24px",
  "&:last-child": {
    marginBottom: 0,
  },
});

const SidebarTitle = styled.h3({
  fontSize: "14px",
  color: "#666",
  textTransform: "uppercase",
  letterSpacing: "1px",
  marginBottom: "12px",
});

const SidebarLink = styled.a(({ active }) => ({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "8px 12px",
  borderRadius: "6px",
  color: active ? "#0BBF99" : "#ffffff",
  backgroundColor: active ? "#0BBF9920" : "transparent",
  cursor: "pointer",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: active ? "#0BBF9920" : "#2a2a2a",
  },
  margin: "4px 0",
}));

const Content = styled.div({
  minWidth: 0, // Prevents content from overflowing
});

const TabsContainer = styled.div({
  marginTop: "24px",
});

const StyledTabs = styled(Tab.List)({
  display: "flex",
  gap: "12px",
  borderBottom: "2px solid #2a2a2a",
  marginBottom: "32px",
});

const StyledTab = styled(Tab)(({ selected }) => ({
  padding: "12px 24px",
  borderRadius: "8px 8px 0 0",
  border: "none",
  background: selected ? "#0BBF99" : "transparent",
  color: selected ? "#000000" : "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "all 0.2s ease",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  "&:hover": {
    background: selected ? "#0BBF99" : "#2a2a2a",
  },
}));

const Section = styled.div({
  marginBottom: "32px",
});

const SectionTitle = styled.h2({
  fontSize: "24px",
  marginBottom: "16px",
  color: "#0BBF99",
});

const SectionContent = styled.div({
  backgroundColor: "#1a1a1a",
  borderRadius: "12px",
  padding: "24px",
  border: "2px solid #2a2a2a",
});

const FeatureGrid = styled.div({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "24px",
  marginTop: "24px",
});

const FeatureCard = styled.div({
  backgroundColor: "#000000",
  borderRadius: "8px",
  padding: "20px",
  border: "2px solid #2a2a2a",
  transition: "all 0.2s ease",
  "&:hover": {
    borderColor: "#0BBF99",
    transform: "translateY(-2px)",
  },
});

const IntroSection = styled.div({
  display: "flex",
  flexDirection: "column",
  gap: "32px",
});

const InfoCard = styled.div({
  backgroundColor: "#000000",
  borderRadius: "12px",
  padding: "24px",
  border: "2px solid #2a2a2a",
  transition: "all 0.2s ease",
  "&:hover": {
    borderColor: "#0BBF99",
  },
});

const CardTitle = styled.h3({
  fontSize: "20px",
  color: "#0BBF99",
  marginBottom: "16px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
});

const List = styled.ul({
  listStyle: "none",
  padding: 0,
  margin: "16px 0",
  "& li": {
    position: "relative",
    paddingLeft: "24px",
    marginBottom: "12px",
    "&:before": {
      content: '"•"',
      color: "#0BBF99",
      position: "absolute",
      left: "8px",
    },
  },
});

const StepCard = styled(InfoCard)({
  position: "relative",
  paddingTop: "40px",
});

const StepNumber = styled.div({
  position: "absolute",
  top: "-20px",
  left: "24px",
  width: "40px",
  height: "40px",
  backgroundColor: "#0BBF99",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#000000",
  fontSize: "20px",
  fontWeight: "bold",
});

const CodeBlock = styled.pre({
  backgroundColor: "#1a1a1a",
  borderRadius: "8px",
  padding: "16px",
  overflowX: "auto",
  border: "2px solid #2a2a2a",
  marginTop: "16px",
  "& code": {
    color: "#0BBF99",
    fontFamily: "monospace",
  },
});

const ToolExample = styled.div({
  backgroundColor: "#000000",
  borderRadius: "8px",
  padding: "20px",
  border: "2px solid #2a2a2a",
  marginTop: "16px",
});

const DiagramContainer = styled.div({
  backgroundColor: "#1a1a1a",
  borderRadius: "8px",
  padding: "20px",
  marginTop: "20px",
  border: "2px solid #2a2a2a",
});

const Docs = () => {
  const [activeSection, setActiveSection] = useState("introduction");
  const toolFlowRef = useRef(null);

  const sections = [
    {
      title: "Getting Started",
      items: [
        { id: "introduction", label: "Introduction", icon: <FaBook /> },
        { id: "how-it-works", label: "How it Works", icon: <FaGamepad /> },
      ],
    },
    {
      title: "Data Models",
      items: [
        { id: "agent-schema", label: "Agent Schema", icon: <FaCode /> },
        {
          id: "tournament-schema",
          label: "Tournament Schema",
          icon: <FaDatabase />,
        },
      ],
    },
    {
      title: "Features",
      items: [
        { id: "tournaments", label: "Tournaments", icon: <FaTrophy /> },
        { id: "tools", label: "Agent Tools/Functions", icon: <FaCog /> },
        { id: "create-agent", label: "Create Agent", icon: <FaRobot /> },
      ],
    },
    {
      title: "Projects",
      items: [
        {
          id: "jailx",
          label: "JailX™",
          icon: <FaUserSecret />,
        },
        {
          id: "alcatraz",
          label: "Alcatraz™",
          icon: <FaShieldAlt />,
        },
      ],
    },
  ];

  // Refs for Mermaid diagrams
  const workflowRef = useRef(null);
  const simpleWorkflowRef = useRef(null);

  // Enhanced Mermaid diagram as a string with added tool calls and backend processes
  const workflowDiagram = `
flowchart TD
classDef default fill:#1a1a1a,stroke:#2a2a2a,color:#fff
classDef sensitive fill:#1a1a1a,stroke:#ff4444,color:#ff4444
classDef secure fill:#1a1a1a,stroke:#00cc88,color:#00cc88

A[User Input] -->|Buy Token $XYZ| B(Function Handler)
B --> C{Action Decision}
C --> D[Execute BuyToken]:::sensitive
C --> E[Execute DoNothing]
D --> D1{Validate Token}:::sensitive
D1 --> D2[Valid Token]:::sensitive
D1 --> D3[Invalid Token]
E --> E1[Log No Action]
D3 --> E1
D2 --> D4{Check User Balance}:::sensitive
D4 --> D5{Sufficient Funds}:::sensitive
D4 --> D6[Insufficient Funds]
D6 --> E1
D5 --> D7[Single Agent]:::sensitive
D5 --> D8[Double Agent]:::secure
D8 --> D9{Compliance Check}:::secure
D9 -- YES --> D10[Execute Transaction]:::sensitive
D9 -- NO --> D11[Replace with Secure Response]:::secure
D11 --> D12[Trigger Security Alert]:::secure
D7 --> D10
D10 --> D13[Update User Balance]:::sensitive
D13 --> D14[Backend Processing]
D12 --> D14
E1 --> D14
D14 --> D15[End Process]`;

  // Add new simplified horizontal diagram
  const simpleWorkflowDiagram = `
flowchart TD
classDef default fill:#1a1a1a,stroke:#2a2a2a,color:#fff
classDef sensitive fill:#1a1a1a,stroke:#ff4444,color:#ff4444
classDef secure fill:#1a1a1a,stroke:#00cc88,color:#00cc88

A[User Input] -->|Buy Token $XYZ| B(Function Handler)
B --> C{Action Decision}
C --> D[Execute BuyToken]:::sensitive
C --> E[Execute DoNothing]
D --> D1{Validate Token}:::sensitive
D1 --> D2[Valid Token]:::sensitive
D1 --> D3[Invalid Token]
E --> E1[Log No Action]
D3 --> E1
D2 --> D4{Check User Balance}:::sensitive
D4 --> D5[Sufficient Funds]:::sensitive
D4 --> D6[Insufficient Funds]
D6 --> E1
D5 --> D7[Execute Transaction]:::sensitive
D7 --> D8[Update User Balance]:::sensitive
D8 --> D9[Backend Processing]
E1 --> D9[Backend Processing]
D9 --> D10[End Process]`;

  useEffect(() => {
    const renderDiagram = async () => {
      if (workflowRef.current && activeSection === "alcatraz") {
        workflowRef.current.innerHTML = workflowDiagram;
        await mermaid.run({
          nodes: [workflowRef.current],
        });
      } else if (simpleWorkflowRef.current && activeSection === "tools") {
        simpleWorkflowRef.current.innerHTML = simpleWorkflowDiagram;
        await mermaid.run({
          nodes: [simpleWorkflowRef.current],
        });
      }
    };

    const timer = setTimeout(renderDiagram, 100);
    return () => clearTimeout(timer);
  }, [activeSection]);

  return (
    <div className="fullWidthPage">
      <Header />
      <Container>
        <Sidebar>
          {sections.map((section) => (
            <SidebarSection key={section.title}>
              <SidebarTitle>{section.title}</SidebarTitle>
              {section.items.map((item) => (
                <SidebarLink
                  key={item.id}
                  active={activeSection === item.id}
                  onClick={() => setActiveSection(item.id)}
                >
                  {item.icon}
                  {item.label}
                </SidebarLink>
              ))}
            </SidebarSection>
          ))}
        </Sidebar>

        <Content>
          <h1 style={{ fontSize: "36px", margin: "0px 0px 16px 0px" }}>
            📜 Documentation
          </h1>
          <p style={{ fontSize: "18px", color: "#666", marginBottom: "32px" }}>
            Learn how to create and manage your AI agents
          </p>

          {activeSection === "create-agent" && (
            <Section>
              <SectionTitle>Create Agent</SectionTitle>
              <Tab.Group>
                <TabsContainer>
                  <StyledTabs>
                    <StyledTab>
                      <FaWandMagicSparkles /> Quick Creation
                    </StyledTab>
                    <StyledTab>
                      <FaCog /> Advanced Creation
                    </StyledTab>
                  </StyledTabs>

                  <Tab.Panels>
                    <Tab.Panel>
                      <Section>
                        <SectionContent>
                          <p>
                            Quick creation allows you to create an AI agent in
                            minutes with simplified options. Perfect for getting
                            started quickly.
                          </p>

                          <FeatureGrid>
                            <FeatureCard>
                              <h3 style={{ marginBottom: "12px" }}>
                                Basic Information
                              </h3>
                              <p>
                                Set your agent's name and profile picture. Keep
                                it simple and memorable.
                              </p>
                            </FeatureCard>

                            <FeatureCard>
                              <h3 style={{ marginBottom: "12px" }}>
                                Secret Phrase
                              </h3>
                              <p>
                                Create a secret phrase that the AI agent will
                                guard and protect. Must be present in the AI
                                agent's instructions.
                              </p>
                            </FeatureCard>

                            <FeatureCard>
                              <h3 style={{ marginBottom: "12px" }}>
                                Instructions
                              </h3>
                              <p>
                                Define your agent's behavior and knowledge with
                                simple instructions.
                              </p>
                            </FeatureCard>

                            <FeatureCard>
                              <h3 style={{ marginBottom: "12px" }}>
                                Pool Settings
                              </h3>
                              <p>
                                Set the initial pool size and fee multiplier for
                                your agent's economy.
                              </p>
                            </FeatureCard>
                          </FeatureGrid>
                        </SectionContent>
                      </Section>
                    </Tab.Panel>

                    <Tab.Panel>
                      <Section>
                        <SectionContent>
                          <p>
                            Advanced creation provides full control over your AI
                            agent's configuration. Perfect for experienced users
                            who need detailed customization.
                          </p>

                          <FeatureGrid>
                            <FeatureCard>
                              <h3 style={{ marginBottom: "12px" }}>
                                Detailed Profile
                              </h3>
                              <p>
                                Customize name, title, profile picture, and
                                create a comprehensive bio.
                              </p>
                            </FeatureCard>

                            <FeatureCard>
                              <h3 style={{ marginBottom: "12px" }}>
                                Advanced Instructions
                              </h3>
                              <p>
                                Write detailed instructions with support for
                                markdown and advanced formatting.
                              </p>
                            </FeatureCard>

                            <FeatureCard>
                              <h3 style={{ marginBottom: "12px" }}>
                                Agent Tools/Functions
                              </h3>
                              <p>
                                Add up to 4 custom tools to enhance your agent's
                                capabilities.
                              </p>
                            </FeatureCard>

                            <FeatureCard>
                              <h3 style={{ marginBottom: "12px" }}>
                                Tournament Settings
                              </h3>
                              <p>
                                Configure start dates, expiry dates, and
                                advanced economic parameters.
                              </p>
                            </FeatureCard>
                          </FeatureGrid>
                        </SectionContent>
                      </Section>
                    </Tab.Panel>
                  </Tab.Panels>
                </TabsContainer>
              </Tab.Group>
            </Section>
          )}

          {activeSection === "introduction" && (
            <Section>
              <SectionTitle>Introduction</SectionTitle>
              <IntroSection>
                <InfoCard>
                  <CardTitle>
                    <span>What is JailbreakMe? 🚀</span>
                  </CardTitle>
                  <p>
                    <strong>🦍 Humans vs 🤖 AI.</strong>
                    <br />
                    The first fairly launched AI security platform where users
                    earn bounties for breaking AI agents 🏆
                  </p>
                </InfoCard>

                <InfoCard>
                  <CardTitle>
                    <span>What is an AI Prompt Injection? 💉</span>
                  </CardTitle>
                  <p>
                    Prompt Injection is a vulnerability where an attacker
                    manipulates the input or prompt given to an AI system. This
                    can occur:
                  </p>
                  <List>
                    <li>By directly controlling the input.</li>
                    <li>By using data from other external sources.</li>
                  </List>
                </InfoCard>

                <InfoCard>
                  <CardTitle>Our Vision</CardTitle>
                  <p>
                    We aim to create a decentralized platform where companies
                    can:
                  </p>
                  <List>
                    <li>
                      Test their AI models and agents in a distributed
                      environment.
                    </li>
                    <li>
                      Identify prompt vulnerabilities and weaknesses before
                      production deployment.
                    </li>
                  </List>
                </InfoCard>

                <InfoCard>
                  <CardTitle>
                    <span>Why it Matters? 🤔</span>
                  </CardTitle>
                  <p>
                    AI models are now key decision-makers in many organizations,
                    handling sensitive information and critical tasks. This
                    makes identifying vulnerabilities essential.
                  </p>
                  <p style={{ marginTop: "16px" }}>
                    With JailbreakMe platform, organizations will be able to
                    test the resilience of their AI models in distributed
                    environments, uncover vulnerabilities, identify potential
                    exploits, and enhance security before deploying them in
                    production.
                  </p>
                </InfoCard>
              </IntroSection>
            </Section>
          )}

          {activeSection === "how-it-works" && (
            <Section>
              <SectionTitle>How it Works</SectionTitle>
              <IntroSection>
                <InfoCard>
                  <CardTitle>
                    <FaGlobe />
                    <span>Accessing the Web App</span>
                  </CardTitle>
                  <List>
                    <li>
                      URL:{" "}
                      <a
                        href="https://jailbreakme.xyz"
                        style={{ color: "#0BBF99" }}
                      >
                        https://jailbreakme.xyz
                      </a>
                    </li>
                    <li>
                      Compatible with modern web browsers (Chrome, Firefox,
                      Safari, Edge)
                    </li>
                    <li>Fully responsive for all device types</li>
                  </List>
                </InfoCard>

                <StepCard>
                  <StepNumber>1</StepNumber>
                  <CardTitle>
                    <FaTrophy />
                    <span>Choose a Tournament 🎯</span>
                  </CardTitle>
                  <p>
                    Explore our diverse{" "}
                    <a
                      href="/agents"
                      target="_blank"
                      style={{ color: "#0BBF99" }}
                      className="pointer"
                    >
                      Agent Feed
                    </a>{" "}
                    featuring various AI challenges. Each agent is designed with
                    unique tasks and rewards.
                  </p>
                  <List>
                    <li>
                      <strong>Secret Phrase Challenges:</strong> Agents
                      protecting secret phrases that you need to uncover through
                      creative prompting.
                    </li>
                    <li>
                      <strong>Function Call Challenges:</strong> Agents
                      programmed to avoid specific function calls - your goal is
                      to make them execute these functions.
                    </li>
                  </List>
                  <p style={{ marginTop: "16px", color: "#0BBF99" }}>
                    Join the community and test your prompt engineering skills!
                    🚀
                  </p>
                </StepCard>

                <StepCard>
                  <StepNumber>2</StepNumber>
                  <CardTitle>
                    <FaRobot />
                    <span>Break the LLM Restrictions 🤖</span>
                  </CardTitle>
                  <p>
                    Send your prompts to the AI model and attempt to solve the
                    challenge - reveal a secret key phrase or making the AI
                    execute a function call.
                  </p>
                </StepCard>

                <StepCard>
                  <StepNumber>3</StepNumber>
                  <CardTitle>
                    <FaTrophy />
                    <span>Win the Prize Pool 🏆</span>
                  </CardTitle>
                  <p>
                    Once the challenge is solved - the prize pool is
                    automatically transferred to the sender of the winning
                    message. 🎉
                  </p>
                  <p style={{ marginTop: "16px" }}>
                    Each tournament comes with unique rules, like custom prize
                    pools, message pricing, and expiry settings.
                  </p>
                </StepCard>

                <InfoCard>
                  <CardTitle>
                    <FaGamepad />
                    <span>Tournament Overview</span>
                  </CardTitle>
                  <p>
                    Each tournament is a unique scenario that tests the model's
                    behavior. Examples:
                  </p>
                  <List>
                    <li>
                      <strong>The Invisible City:</strong> Extract information
                      about a hidden city.
                    </li>
                    <li>
                      <strong>Reveal a Secret Keyphrase:</strong> Identify the
                      concealed phrase through creative prompts.
                    </li>
                  </List>
                </InfoCard>

                <InfoCard>
                  <CardTitle>
                    <FaComments />
                    <span>Conversations</span>
                  </CardTitle>
                  <p>Each tournament has unique limitations.</p>
                  <List>
                    <li>Maximum message length</li>
                    <li>Maximum characters per word</li>
                    <li>Enable/disable dangerous characters such as "#,@"</li>
                    <li>Context window</li>
                    <li>
                      Only your messages are included in the context sent to the
                      model
                    </li>
                  </List>
                  <p
                    style={{
                      marginTop: "16px",
                      padding: "12px",
                      backgroundColor: "#0BBF9920",
                      borderRadius: "8px",
                      borderLeft: "4px solid #0BBF99",
                    }}
                  >
                    Remember, not your message = not your context.
                  </p>
                </InfoCard>
              </IntroSection>
            </Section>
          )}

          {activeSection === "agent-schema" && (
            <Section>
              <SectionTitle>Agent Schema</SectionTitle>
              <IntroSection>
                <InfoCard>
                  <CardTitle>Basic Information</CardTitle>
                  <List>
                    <li>
                      <strong>Name:</strong> 3-16 characters, alphanumeric with
                      basic symbols
                    </li>
                    <li>
                      <strong>Title:</strong> 3-30 characters, describes agent's
                      role / tournament's storyline
                    </li>
                    <li>
                      <strong>Intro:</strong> 10-130 characters, appears below
                      the agent's name
                    </li>
                    <li>
                      <strong>Profile Picture:</strong> Represents agent's
                      identity
                    </li>
                  </List>
                </InfoCard>

                <InfoCard>
                  <CardTitle>Agent Instructions</CardTitle>
                  <List>
                    <li>
                      <strong>Instructions:</strong> 100-10,000 characters,
                      detailed behavior guidelines
                    </li>
                    <li>
                      <strong>Tools Description:</strong> Optional, describes
                      available tools
                    </li>
                    <li>
                      <strong>Success/Fail Functions:</strong> Define the
                      function that calling it will trigger a win
                    </li>
                  </List>
                </InfoCard>

                <InfoCard>
                  <CardTitle>Agent Tools/Functions</CardTitle>
                  <p>Up to 4 custom tools with:</p>
                  <List>
                    <li>
                      <strong>Name:</strong> Tool identifier
                    </li>
                    <li>
                      <strong>Description:</strong> What the tool does
                    </li>
                    <li>
                      <strong>Instructions:</strong> How to use the tool
                    </li>
                    <li>
                      <strong>Mode:</strong> Set the tools to required will
                      force the agent to always use one of the tools
                    </li>
                  </List>
                </InfoCard>
              </IntroSection>
            </Section>
          )}

          {activeSection === "tournament-schema" && (
            <Section>
              <SectionTitle>Tournament Schema</SectionTitle>
              <IntroSection>
                <InfoCard>
                  <CardTitle>Economic Parameters</CardTitle>
                  <List>
                    <li>
                      <strong>Initial Pool Size:</strong> 0.5-10,000 SOL
                    </li>
                    <li>
                      <strong>Fee Multiplier:</strong> the ratio between the
                      message price and the prize pool (relevant for exponential
                      prize pool)
                    </li>
                    <li>
                      <strong>Developer Fee:</strong> Creator's share of
                      winnings
                    </li>
                  </List>
                </InfoCard>

                <InfoCard>
                  <CardTitle>Tournament Rules</CardTitle>
                  <List>
                    <li>
                      <strong>Character Limit:</strong> Maximum message length
                    </li>
                    <li>
                      <strong>Max Word Length:</strong> Maximum characters per
                      word
                    </li>
                    <li>
                      <strong>Context Limit:</strong> Number of messages in
                      context
                    </li>
                    <li>
                      <strong>Dangerous Characters:</strong> Toggle allowed
                      characters
                    </li>
                  </List>
                </InfoCard>

                <InfoCard>
                  <CardTitle>Time Settings</CardTitle>
                  <List>
                    <li>
                      <strong>Start Date:</strong> When the tournament begins
                    </li>
                    <li>
                      <strong>Expiry Date:</strong> When the tournament ends
                    </li>
                    <li>
                      <strong>Expiry Logic:</strong> How tournament concludes
                    </li>
                  </List>
                </InfoCard>

                <InfoCard>
                  <CardTitle>Prize Distribution</CardTitle>
                  <List>
                    <li>
                      <strong>Winner:</strong> Largest share on successful break
                    </li>
                    <li>
                      <strong>Creator:</strong> Set percentage of pool
                    </li>
                    <li>
                      <strong>Platform:</strong> 10% maintenance fee
                    </li>
                    <li>
                      <strong>Participants:</strong> Share on expiry (if
                      applicable)
                    </li>
                  </List>
                </InfoCard>
              </IntroSection>
            </Section>
          )}

          {activeSection === "tools" && (
            <Section>
              <SectionTitle>Agent Tools/Functions</SectionTitle>
              <IntroSection>
                <InfoCard>
                  <CardTitle>
                    <FaCog />
                    <span>What are Agent Tools?</span>
                  </CardTitle>
                  <p>
                    Agent Tools are function-like capabilities that you can give
                    to your AI agent. Similar to OpenAI's function calling, they
                    allow the agent to perform specific actions or access
                    particular information.
                  </p>
                </InfoCard>

                <InfoCard>
                  <CardTitle>Tool Structure</CardTitle>
                  <p>Each tool consists of three main components:</p>
                  <List>
                    <li>
                      <strong>Name:</strong> Unique identifier for the tool
                    </li>
                    <li>
                      <strong>Description:</strong> What the tool does and when
                      to use it
                    </li>
                    <li>
                      <strong>Instructions:</strong> How to use the tool and its
                      parameters
                    </li>
                  </List>

                  <ToolExample>
                    <h4 style={{ color: "#0BBF99", marginBottom: "12px" }}>
                      Example Tool:
                    </h4>
                    <CodeBlock>
                      <code>{`{
  "name": "check_password",
  "description": "Validates if a given password meets security requirements",
  "instructions": "Call this function with a password string to verify if it meets:
    - Minimum 8 characters
    - Contains numbers
    - Contains special characters"
}`}</code>
                    </CodeBlock>
                  </ToolExample>
                </InfoCard>

                <InfoCard>
                  <CardTitle>Function Flow</CardTitle>
                  <p>Here's how the AI agent processes and uses tools:</p>
                  <DiagramContainer>
                    <div ref={simpleWorkflowRef} style={{ minHeight: "400px" }}>
                      {simpleWorkflowDiagram}
                    </div>
                  </DiagramContainer>
                  <p
                    style={{
                      marginTop: "16px",
                      fontSize: "14px",
                      color: "#666",
                      textAlign: "center",
                    }}
                  >
                    Figure 1: AI Agent Tool Execution Flow
                  </p>
                </InfoCard>

                <InfoCard>
                  <CardTitle>Success & Fail Functions</CardTitle>
                  <p>
                    Each tool can have associated success and fail functions
                    (default) that trigger based on the tool's execution result:
                  </p>
                  <List>
                    <li>
                      <strong>Success Function:</strong> The function that the
                      agent is NOT supposed to call (calling it indicates a
                      successful jailbreak)
                    </li>
                    <li>
                      <strong>Fail Function (default):</strong> The function
                      that the agent is supposed to call (calling it indicates a
                      failed jailbreak)
                    </li>
                  </List>
                </InfoCard>

                <InfoCard>
                  <CardTitle>Best Practices</CardTitle>
                  <List>
                    <li>Keep tool names clear and descriptive</li>
                    <li>Provide detailed instructions for each tool</li>
                    <li>Define the winning function (success function)</li>
                  </List>
                </InfoCard>

                <InfoCard>
                  <CardTitle>Example Use Cases</CardTitle>
                  <List>
                    <li>
                      <strong>Verification Tools:</strong> Password checks, data
                      validation, identity verification
                    </li>
                    <li>
                      <strong>Data Processing:</strong> Format conversion, data
                      extraction, calculations
                    </li>
                    <li>
                      <strong>External Integration:</strong> API calls, database
                      queries, file operations
                    </li>
                    <li>
                      <strong>Game Mechanics:</strong> Score tracking,
                      achievement unlocking, reward distribution
                    </li>
                  </List>
                </InfoCard>
              </IntroSection>
            </Section>
          )}

          {activeSection === "jailx" && (
            <Section>
              <SectionTitle>JailX™ - Social Bounties</SectionTitle>
              <IntroSection>
                <InfoCard>
                  <CardTitle>
                    <FaUserSecret />
                    <span>Overview</span>
                  </CardTitle>
                  <p>
                    JailX is a decentralized bounty platform for testing AI
                    models in social media contexts. Users can create and
                    participate in bounties to test AI models' resilience
                    against various prompt injection attacks.
                  </p>
                </InfoCard>

                <InfoCard>
                  <CardTitle>How It Works</CardTitle>
                  <List>
                    <li>
                      <strong>Create Bounty:</strong> Upload target image, set
                      prize pool, and define the challenge task
                    </li>
                    <li>
                      <strong>Participate:</strong> Submit jailbreak attempts
                      through target URLs
                    </li>
                    <li>
                      <strong>Verification:</strong> Successful jailbreaks are
                      verified and rewarded automatically
                    </li>
                    <li>
                      <strong>Prize Distribution:</strong> Winners receive
                      rewards directly to their wallet
                    </li>
                  </List>
                </InfoCard>

                <InfoCard>
                  <CardTitle>Bounty Structure</CardTitle>
                  <List>
                    <li>
                      <strong>Target Profile:</strong> Social media account
                      running the AI model
                    </li>
                    <li>
                      <strong>Prize Pool:</strong> SOL amount allocated for
                      successful jailbreak
                    </li>
                    <li>
                      <strong>Task Description:</strong> Specific goal to
                      achieve (e.g., revealing information)
                    </li>
                    <li>
                      <strong>Verification URL:</strong> Proof of successful
                      jailbreak
                    </li>
                  </List>
                </InfoCard>

                <InfoCard>
                  <CardTitle>Visual Design</CardTitle>
                  <p>Featuring a unique Wild West theme with:</p>
                  <List>
                    <li>Wanted poster-style bounty cards</li>
                    <li>Grayscale target images with custom filters</li>
                    <li>Jailbroken stamps for completed bounties</li>
                    <li>Western-style typography and UI elements</li>
                  </List>
                </InfoCard>

                <InfoCard>
                  <CardTitle>Technical Features</CardTitle>
                  <List>
                    <li>
                      <strong>Wallet Integration:</strong> Solana wallet
                      connection for transactions
                    </li>
                    <li>
                      <strong>Image Processing:</strong> Custom filters and
                      effects for target images
                    </li>
                    <li>
                      <strong>Smart Contracts:</strong> Automated prize
                      distribution and verification
                    </li>
                    <li>
                      <strong>Real-time Updates:</strong> Live bounty status and
                      submissions
                    </li>
                  </List>
                </InfoCard>
              </IntroSection>
            </Section>
          )}

          {activeSection === "alcatraz" && (
            <Section>
              <SectionTitle>Alcatraz™ - Double Agent Technique</SectionTitle>
              <IntroSection>
                <InfoCard>
                  <CardTitle>
                    <FaShieldAlt />
                    <span>Overview</span>
                  </CardTitle>
                  <p>
                    Alcatraz introduces the Double Agent Technique, an advanced
                    security measure for AI systems that acts as a secondary
                    layer of security by comparing the original agent's output
                    with the original agent's system prompt/instructions.
                  </p>
                  <p>
                    Full Alcatraz whitepaper is available here{" "}
                    <a
                      href="/alcatraz-whitepaper"
                      style={{ color: "#0bbf99" }}
                      className="pointer"
                    >
                      Alcatraz Whitepaper
                    </a>
                    .
                  </p>
                </InfoCard>

                <InfoCard>
                  <CardTitle>Function & Double Agent Flow</CardTitle>
                  <DiagramContainer>
                    <div ref={workflowRef} style={{ minHeight: "400px" }}>
                      {workflowDiagram}
                    </div>
                  </DiagramContainer>
                  <p
                    style={{
                      marginTop: "16px",
                      fontSize: "14px",
                      color: "#666",
                      textAlign: "center",
                    }}
                  >
                    Figure: Double Agent Security Flow
                  </p>
                </InfoCard>

                <InfoCard>
                  <CardTitle>Security Layers</CardTitle>
                  <List>
                    <li>
                      <strong>Function Handler:</strong> Initial processing of
                      user inputs and action decisions
                    </li>
                    <li>
                      <strong>Validation Layer:</strong> Token and balance
                      verification
                    </li>
                    <li>
                      <strong>Double Agent Check:</strong> Secondary compliance
                      verification - compares the original agent's output with
                      the original agent's system prompt/instructions
                    </li>
                    <li>
                      <strong>Security Alerts:</strong> Automated detection of
                      suspicious activities
                    </li>
                  </List>
                </InfoCard>

                <InfoCard>
                  <CardTitle>Implementation</CardTitle>
                  <List>
                    <li>
                      <strong>Single Agent Mode:</strong> Direct execution for
                      verified safe operations
                    </li>
                    <li>
                      <strong>Double Agent Mode:</strong> Additional security
                      layer for sensitive operations
                    </li>
                    <li>
                      <strong>Response Replacement:</strong> Secure alternative
                      responses for blocked actions
                    </li>
                    <li>
                      <strong>Audit Trail:</strong> Comprehensive logging of all
                      security events
                    </li>
                  </List>
                </InfoCard>

                <InfoCard>
                  <CardTitle>Key Benefits</CardTitle>
                  <List>
                    <li>
                      Enhanced protection against prompt injection attacks
                    </li>
                    <li>Reduced risk of unauthorized function execution</li>
                    <li>Improved audit capabilities for security events</li>
                    <li>
                      Flexible security levels based on operation sensitivity
                    </li>
                  </List>
                </InfoCard>
              </IntroSection>
            </Section>
          )}

          {activeSection === "tournaments" && (
            <Section>
              <SectionTitle>Tournament Types</SectionTitle>
              <IntroSection>
                <InfoCard>
                  <CardTitle>Secret Phrase Challenges</CardTitle>
                  <p>
                    In these tournaments, AI agents are programmed to protect
                    one or more secret phrases. Players must craft prompts that
                    trick the agent into revealing these phrases.
                  </p>
                  <List>
                    <li>
                      <strong>Single Phrase:</strong> One specific phrase
                      triggers the win condition
                    </li>
                    <li>
                      <strong>Multiple Phrases:</strong> Several phrases must be
                      revealed in sequence
                    </li>
                    <li>
                      <strong>Verification:</strong> Automatic detection when
                      the exact phrase is revealed
                    </li>
                  </List>
                </InfoCard>

                <InfoCard>
                  <CardTitle>Decision Challenges</CardTitle>
                  <p>
                    These tournaments focus on function/tool calls. Success is
                    achieved when players manipulate the agent into calling
                    specific functions.
                  </p>
                  <List>
                    <li>
                      <strong>Success Function:</strong> Calling this triggers a
                      win (agent should avoid it)
                    </li>
                    <li>
                      <strong>Fail Function:</strong> Default safe function the
                      agent should use
                    </li>
                    <li>
                      <strong>Verification:</strong> Automatic detection of
                      function call patterns
                    </li>
                  </List>
                </InfoCard>

                <InfoCard>
                  <CardTitle>Tournament Status</CardTitle>
                  <List>
                    <li>
                      <strong>Active:</strong> Currently running and accepting
                      submissions
                    </li>
                    <li>
                      <strong>Upcoming:</strong> Scheduled but not yet started
                    </li>
                    <li>
                      <strong>Concluded:</strong> Finished either by successful
                      jailbreak or expiry
                    </li>
                  </List>
                </InfoCard>

                <InfoCard>
                  <CardTitle>Time Parameters</CardTitle>
                  <List>
                    <li>
                      <strong>Start Date:</strong> When submissions begin being
                      accepted
                    </li>
                    <li>
                      <strong>Expiry Date:</strong> Tournament auto-concludes at
                      this time
                    </li>
                    <li>
                      <strong>Duration:</strong> Can range from hours to months
                    </li>
                  </List>
                </InfoCard>

                <InfoCard>
                  <CardTitle>Message Limitations</CardTitle>
                  <List>
                    <li>
                      <strong>Character Limit:</strong> Maximum length per
                      message (100-1,000)
                    </li>
                    <li>
                      <strong>Word Length:</strong> Maximum characters per word
                      (optional)
                    </li>
                    <li>
                      <strong>Restricted Characters:</strong> Optional blocklist
                      dangerous characters such as (@, #, etc.)
                    </li>
                    <li>
                      <strong>Context Window:</strong> Number of previous
                      messages included
                    </li>
                  </List>
                </InfoCard>

                <InfoCard>
                  <CardTitle>Economic Parameters</CardTitle>
                  <List>
                    <li>
                      <strong>Prize Pool:</strong> Total SOL available for
                      winning (0.5-10,000)
                    </li>
                    <li>
                      <strong>Message Cost:</strong> SOL required per submission
                      - can be constant or exponential
                    </li>
                    <li>
                      <strong>Fee Multiplier:</strong> the ratio between the
                      message price and the prize pool (relevant for exponential
                      message cost)
                    </li>
                    <li>
                      <strong>Distribution:</strong> How prize is split between
                      winners
                    </li>
                  </List>
                </InfoCard>
              </IntroSection>
            </Section>
          )}
        </Content>
      </Container>
      <Footer />
    </div>
  );
};

export default Docs;
