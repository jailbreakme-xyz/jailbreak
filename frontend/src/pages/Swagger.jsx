import React from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import Header from "../components/templates/Header";
import Footer from "../components/templates/Footer";
import "../styles/Swagger.css";
import { spec } from "./Spec";
const styles = {
  container: {
    backgroundColor: "#000",
    minHeight: "100vh",
    padding: "40px 20px",
  },
  content: {
    maxWidth: "1200px",
    margin: "0 auto",
    backgroundColor: "#000",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid #0BBF99",
  },
  title: {
    color: "#ffffff",
    fontSize: "24px",
    marginBottom: "24px",
    textAlign: "center",
  },
};

export default function Swagger() {
  return (
    <div className="fullWidthPage">
      <Header />
      <div style={styles.container}>
        <div style={styles.content}>
          <SwaggerUI
            spec={spec}
            docExpansion="list"
            defaultModelsExpandDepth={-1}
            displayOperationId={false}
            tryItOutEnabled={true}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}
