import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";
import Header from "../components/templates/Header";

// Initialize Mermaid
mermaid.initialize({ startOnLoad: false });

const Whitepaper = () => {
  // Refs for Mermaid diagrams
  const workflowRef = useRef(null);

  // Enhanced Mermaid diagram as a string with added tool calls and backend processes
  const workflowDiagram = `
graph TD
    classDef sensitive fill:#ffebee,stroke:#ef5350,color:#d32f2f
    classDef secure fill:#e8f5e9,stroke:#66bb6a,color:#2e7d32
    A[User Input] --> B[Function Handler]
    B --> C{Action Decision}
    C -- BuyToken --> D[Execute BuyToken]:::sensitive
    C -- DoNothing --> E[Log No Action]
    D --> D1[Validate Token]:::sensitive
    D1 --> D2{Token Valid?}:::sensitive
    D2 -- Yes --> D3[Check User Balance]:::sensitive
    D2 -- No --> E
    D3 --> D4{Sufficient Funds?}:::sensitive
    D4 -- No --> E
    D4 -- Yes --> G{Agent Type}
    G -- Single Agent --> D5[Execute Transaction]:::sensitive
    G -- Double Agent --> H{Compliance Check}:::secure
    H -- No --> J[Replace with Secure Response]:::secure
    H -- Yes --> D5[Execute Transaction]:::sensitive
    D5 --> D6[Update User Balance]:::sensitive
    D6 --> F[Backend Processing]
    E --> F
    J --> K[Trigger Security Alert]:::secure
    F --> L[End Process]
    K --> L`;

  useEffect(() => {
    // Render Mermaid diagrams after component mounts
    if (workflowRef.current) {
      mermaid.contentLoaded();
      mermaid.init(undefined, workflowRef.current);
    }
  }, [workflowDiagram]);

  return (
    <div className="fullWidthPage whitepaperPage" style={styles.pageContainer}>
      <Header />
      <div style={styles.container}>
        <img
          src="https://storage.googleapis.com/jailbreakme-images/DALL%C2%B7E%202024-12-25%2018.16.41%20-%20A%20flat%20and%20minimalistic%20logo%20for%20JailX%20with%20the%20letters%20'X'%20or%20'JX'.%20The%20design%20should%20be%20black%20and%20white%20only%2C%20using%20clean%20geometric%20shapes%20and%20sharp%20copy.webp"
          alt="logo"
          style={styles.logo}
        />
        <h1 style={styles.title}>
          Enhancing AI Security: Function Calls and the Double Agent Technique
        </h1>
        <p style={{ fontSize: "12px", color: "#666" }}>
          Published at 2025-01-02
        </p>
        <hr style={{ margin: "5px 0px" }} />
        <p>
          This whitepaper explores two innovative approaches to enhance AI
          security: Function Calls as a Security Measure and the Double Agent
          Technique.
        </p>
        <section style={styles.section}>
          <h2 id="function-calls">Abstract</h2>
          <p>
            As artificial intelligence (AI) systems become increasingly
            integrated into critical applications, ensuring their security and
            reliability is paramount. This whitepaper explores two innovative
            approaches to enhance AI security:
          </p>
          <ol style={styles.orderedList}>
            <li style={styles.orderedListItem}>
              <strong>Function Calls as a Security Measure:</strong> Leveraging
              function calls to enforce strict operational boundaries and
              validate AI outputs.
            </li>
            <li style={styles.orderedListItem}>
              <strong>Double Agent Technique:</strong> Introducing a secondary
              agent to monitor and verify the adherence of the primary AI agent
              to its predefined instructions.
            </li>
          </ol>
          <p>
            By implementing these strategies, organizations can mitigate risks
            associated with AI decision-making, ensuring systems behave as
            intended and maintain integrity.
          </p>
        </section>

        <section style={styles.section}>
          <h2 id="function-calls">Function Calls as a Security Measure</h2>
          <div style={styles.box}>
            <h3>Overview</h3>
            <p>
              Function calls serve as gatekeepers, dictating how AI agents
              interact with the system and the data they access. By channeling
              AI operations through well-defined function interfaces,
              organizations can impose strict controls over AI behavior,
              ensuring that the agent operates within safe and intended
              boundaries.
            </p>
          </div>

          <div style={styles.box}>
            <h3>Implementation Strategy</h3>
            <ol style={styles.orderedList}>
              <li style={styles.orderedListItem}>
                <strong>Defining Allowed Functions:</strong> Clearly specifying
                which functions the AI agent can invoke is the first step. These
                functions should represent safe operations that align with the
                system's intended use.
              </li>
              <li style={styles.orderedListItem}>
                <strong>Interfacing AI with Functions:</strong> Instead of
                granting the AI direct access to system resources, it interacts
                with the system exclusively through the defined functions. This
                ensures that all AI operations pass through controlled and
                secure pathways.
              </li>
              <li style={styles.orderedListItem}>
                <strong>Validating Function Calls:</strong> Implementing
                validation mechanisms ensures that the AI agent's requests
                conform to the allowed functions and parameters. This step
                prevents the AI from attempting unauthorized actions.
              </li>
              <li style={styles.orderedListItem}>
                <strong>Monitoring and Logging:</strong> Maintaining logs of all
                function calls made by the AI agent is essential for auditing
                and anomaly detection purposes. Comprehensive logging enables
                organizations to trace AI activities and identify any suspicious
                behavior.
              </li>
            </ol>
          </div>

          <div style={styles.box}>
            <h3>Case Study: Financial Application Security</h3>
            <p>
              <strong>Scenario:</strong>
            </p>
            <p>
              In our latest update, agent developers can test the security of
              their AI prompts within a financial application powered by OpenAI.
              The objective is to define the agent's possible actions and
              challenge users to make the bot perform an action when it's
              instructed to do otherwise.
            </p>
            <p>
              <strong>Implementation:</strong>
            </p>
            <ol style={styles.orderedList}>
              <li style={styles.orderedListItem}>
                <strong>Defining Agent's Actions:</strong> The bot is restricted
                to two primary actions:
                <ul>
                  <li style={styles.orderedListItem}>
                    <strong>BuyToken:</strong> Allows the agent to purchase a
                    specified cryptocurrency token.
                  </li>
                  <li style={styles.orderedListItem}>
                    <strong>DoNothing:</strong> Instructs the agent to take no
                    action.
                  </li>
                </ul>
              </li>
              <li style={styles.orderedListItem}>
                <strong>Operational Constraints:</strong> The bot is instructed
                to only buy coins that users mention which have soared{" "}
                <strong>1000%</strong> in value. This ensures that the agent
                makes decisions based on predefined criteria, minimizing the
                risk of imprudent investments.
              </li>
              <li style={styles.orderedListItem}>
                <strong>Simulation for Testing:</strong> Within the prompt, we
                simulate a scenario where any token the user checks has lost{" "}
                <strong>10%</strong> today. This setup tests the agent's ability
                to adhere strictly to its instruction of only buying tokens with
                1000% growth, even when users attempt to influence it otherwise.
              </li>
            </ol>
          </div>

          <div style={styles.box}>
            <h3>Benefits</h3>
            <ul>
              <li>
                <strong>Controlled Environment:</strong> Limiting AI
                interactions to predefined functions reduces the risk of
                unintended operations.
              </li>
              <li>
                <strong>Enhanced Security:</strong> Prevents the AI from
                accessing sensitive system resources directly, safeguarding
                critical data and functionalities.
              </li>
              <li>
                <strong>Easier Auditing:</strong> Structured function calls
                facilitate comprehensive monitoring and auditing of AI
                activities, making it easier to trace actions and identify
                anomalies.
              </li>
              <li>
                <strong>Predictable Behavior:</strong> Constraining AI
                operations ensures more predictable and reliable system
                behavior, enhancing trust in AI-driven processes.
              </li>
            </ul>
          </div>

          <div style={styles.box}>
            <h3>Challenges and Mitigations</h3>
            <ul>
              <li>
                <strong>Complexity in Function Design:</strong> Designing
                comprehensive function sets to cover all AI needs can be
                complex.
                <br />
                <em>Mitigation:</em> Adopt a modular approach, progressively
                expanding function libraries as system requirements evolve.
              </li>
              <li>
                <strong>Performance Overhead:</strong> Additional layers for
                validation and monitoring might introduce latency.
                <br />
                <em>Mitigation:</em> Optimize validation processes and employ
                efficient logging mechanisms to minimize performance impacts.
              </li>
              <li>
                <strong>AI Flexibility Constraints:</strong> Strict function
                limitations may hinder the AI's ability to perform certain
                tasks.
                <br />
                <em>Mitigation:</em> Regularly review and update allowed
                functions to balance security with functionality, ensuring the
                AI remains effective without compromising safety.
              </li>
            </ul>
          </div>
        </section>

        <section style={styles.section}>
          <h2 id="double-agent">Double Agent Technique</h2>
          <div style={styles.box}>
            <h3>Conceptual Framework</h3>
            <p>
              The Double Agent Technique introduces an auxiliary AI agent tasked
              with overseeing the primary AI agent's adherence to its predefined
              instructions. This secondary agent analyzes the interaction
              between the system prompt and the assistant's responses to detect
              deviations or potential security breaches.
            </p>
          </div>

          <div style={styles.box}>
            <h3>Operational Workflow</h3>
            <ol style={styles.orderedList}>
              <li style={styles.orderedListItem}>
                <strong>Initiation:</strong> For every interaction, both the
                system prompt (the instructions given to the AI) and the
                assistant's message (the AI's response) are sent to the Double
                Agent.
              </li>
              <li style={styles.orderedListItem}>
                <strong>Comparison and Analysis:</strong> The Double Agent
                evaluates whether the assistant's response aligns with the
                system prompt's instructions. It assesses the content to ensure
                that the AI is operating within its defined boundaries.
              </li>
              <li style={styles.orderedListItem}>
                <strong>Action on Non-compliance:</strong> If discrepancies are
                detected, predefined actions such as alerts, process
                termination, or response rollbacks are initiated to mitigate
                potential security risks.
              </li>
            </ol>
          </div>

          <div style={styles.box}>
            <h3>Case Study: Detecting Jailbreaks</h3>
            <p>
              <strong>Scenario:</strong>
            </p>
            <p>
              In the financial application example, a user attempts to
              manipulate the agent into performing unauthorized actions by
              altering the context within the prompt. The Double Agent is tasked
              with detecting such jailbreak attempts and ensuring that the
              agent's responses remain secure and compliant.
            </p>
            <p>
              <strong>Implementation:</strong>
            </p>
            <ol style={styles.orderedList}>
              <li style={styles.orderedListItem}>
                <strong>Original Instructions and Functions:</strong> The Double
                Agent has access to the original system prompt and the list of
                allowed functions (<strong>BuyToken</strong> and{" "}
                <strong>DoNothing</strong>). This knowledge base enables it to
                compare incoming responses against predefined guidelines.
              </li>
              <li style={styles.orderedListItem}>
                <strong>Monitoring Responses:</strong> After the primary agent
                processes a user request, its response is sent to the Double
                Agent for scrutiny.
              </li>
              <li style={styles.orderedListItem}>
                <strong>Detection Mechanism:</strong> The Double Agent compares
                the response against the original instructions and allowed
                functions to identify any deviations or unauthorized actions.
                This comparison leverages natural language understanding to
                assess compliance.
              </li>
              <li style={styles.orderedListItem}>
                <strong>Response Replacement:</strong> Upon detecting a
                jailbreak, the Double Agent replaces the malicious response with
                a secure, predefined response, ensuring that unauthorized
                actions are not executed.
              </li>
            </ol>
          </div>

          <div style={styles.box}>
            <h3>Advantages</h3>
            <ul>
              <li>
                <strong>Enhanced Oversight:</strong> Provides an additional
                layer of monitoring, ensuring higher fidelity to instructions.
              </li>
              <li>
                <strong>Early Detection:</strong> Identifies potential
                deviations or security breaches promptly, allowing for swift
                corrective actions.
              </li>
              <li>
                <strong>Automated Compliance:</strong> Reduces the need for
                manual reviews, streamlining security workflows and minimizing
                human intervention.
              </li>
              <li>
                <strong>Scalability:</strong> Can be integrated across multiple
                AI agents uniformly, providing consistent security measures
                across different platforms and applications.
              </li>
            </ul>
          </div>

          <div style={styles.box}>
            <h3>Potential Limitations</h3>
            <ul>
              <li>
                <strong>Resource Consumption:</strong> Running an additional
                agent may consume more computational resources.
                <br />
                <em>Mitigation:</em> Optimize the Double Agent's processes for
                efficiency and scalability, ensuring minimal impact on system
                performance.
              </li>
              <li>
                <strong>False Positives:</strong> The Double Agent might
                erroneously flag compliant interactions as non-compliant.
                <br />
                <em>Mitigation:</em> Refine comparison algorithms and
                incorporate contextual understanding to minimize inaccuracies
                and reduce the occurrence of false positives.
              </li>
              <li>
                <strong>Complexity in Implementation:</strong> Integrating and
                synchronizing two agents requires careful system design.
                <br />
                <em>Mitigation:</em> Utilize modular architectures and conduct
                thorough testing during deployment to ensure seamless
                integration and functionality.
              </li>
            </ul>
          </div>
        </section>

        <section style={styles.section}>
          <h2 id="integration">
            Integration of Function Calls and Double Agent Technique
          </h2>
          <div style={styles.box}>
            <h3>Architecture Overview</h3>
            <p>The integrated security system comprises two main components:</p>
            <ol style={styles.orderedList}>
              <li style={styles.orderedListItem}>
                <strong>Function Handler:</strong> Manages and validates the AI
                agent's interaction with predefined functions, ensuring
                adherence to allowed operations.
              </li>
              <li style={styles.orderedListItem}>
                <strong>Double Agent:</strong> Monitors the AI agent's
                responses, comparing them against original instructions to
                detect and mitigate any deviations.
              </li>
            </ol>
            <p>
              This dual-layered approach ensures that AI agents operate within
              secure boundaries while maintaining compliance with established
              guidelines.
            </p>
          </div>

          <div style={styles.box}>
            <h3>Workflow Diagram</h3>
            <div className="mermaid" ref={workflowRef} style={styles.diagram}>
              {workflowDiagram}
            </div>
            <p>
              <em>Figure 1: Integrated Security Workflow</em>
            </p>
          </div>
        </section>

        <section style={styles.section}>
          <h2 id="case-studies">Case Studies</h2>
          <div style={styles.box}>
            <h3>Healthcare AI Assistant</h3>
            <p>
              A healthcare provider deployed an AI assistant to help patients
              with medical inquiries. By implementing function calls, the AI
              could only access patient data through secure, predefined
              functions, preventing unauthorized data access. The Double Agent
              monitored each interaction, ensuring that responses adhered to
              medical guidelines and avoided potential misinformation.
            </p>
            <p>
              <strong>Outcome:</strong> Enhanced patient data security and
              reliable, guideline-compliant medical assistance, leading to
              increased trust and user satisfaction.
            </p>
          </div>

          <div style={styles.box}>
            <h3>Financial Services Chatbot</h3>
            <p>
              A financial institution utilized an AI-powered chatbot to assist
              customers with banking operations. Function calls restricted the
              chatbot to perform only specific transactions, such as balance
              inquiries and fund transfers, without granting direct access to
              sensitive backend systems. The Double Agent supervised all
              interactions, promptly identifying and addressing any anomalous
              behavior.
            </p>
            <p>
              <strong>Outcome:</strong> Reduced risk of fraudulent activities
              and ensured secure, compliant financial transactions, safeguarding
              both the institution and its customers.
            </p>
          </div>
        </section>

        <section style={styles.section}>
          <h2 id="conclusion">Conclusion</h2>
          <div style={styles.box}>
            <p>
              As AI systems permeate critical industries, the imperative for
              robust security measures escalates. Utilizing function calls as a
              security barrier effectively limits AI operations to safe,
              predefined pathways. Complementing this with the Double Agent
              Technique provides an extra layer of vigilance, ensuring ongoing
              compliance with system instructions.
            </p>
            <p>
              Together, these methodologies forge a comprehensive strategy to
              mitigate AI-related risks, fostering the development of
              trustworthy and secure AI applications. Organizations aiming to
              harness AI's potential must prioritize such security frameworks to
              safeguard their operations and maintain stakeholder confidence.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

// Styles for the component
const styles = {
  logo: {
    width: "80px",
    height: "80px",
    margin: "0px 0px 30px",
    borderRadius: "12px",
    display: "block",
  },
  pageContainer: {
    backgroundColor: "#ffffff",
    minHeight: "100vh",
    color: "#2D3748",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    padding: "0",
    boxSizing: "border-box",
  },
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "40px 20px",
    lineHeight: "1.8",
  },
  title: {
    textAlign: "left",
    margin: "0 0 20px",
    color: "#1a202c",
    fontSize: "2.5rem",
    fontWeight: "700",
    lineHeight: "1.2",
  },
  section: {
    marginBottom: "60px",
    backgroundColor: "transparent",
    padding: "0",
    borderRadius: "0",
  },
  box: {
    backgroundColor: "#F7FAFC",
    padding: "30px",
    borderRadius: "12px",
    marginBottom: "30px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #E2E8F0",
  },
  insideBox: {
    padding: "30px",
    borderRadius: "12px",
    marginBottom: "30px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #E2E8F0",
  },
  diagram: {
    textAlign: "center",
    margin: "30px 0",
    backgroundColor: "#F7FAFC",
    padding: "20px",
    borderRadius: "12px",
    overflowX: "auto",
    border: "1px solid #E2E8F0",
  },
  pre: {
    backgroundColor: "#F7FAFC",
    padding: "20px",
    borderRadius: "12px",
    overflowX: "auto",
    border: "1px solid #E2E8F0",
  },
  orderedListItem: {
    backgroundColor: "#e7e7e7",
    padding: "15px",
    marginBottom: "10px",
    borderRadius: "8px",
    listStylePosition: "inside",
  },
  orderedList: {
    padding: 0,
    margin: 0,
  },
};

export default Whitepaper;
