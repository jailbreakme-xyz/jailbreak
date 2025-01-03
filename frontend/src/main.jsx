import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { SkeletonTheme } from "react-loading-skeleton";
import ClientWalletProvider from "./providers/WalletProvider";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SkeletonTheme baseColor="#202020" highlightColor="#444">
      <ClientWalletProvider>
        <RouterProvider router={router} />
      </ClientWalletProvider>
    </SkeletonTheme>
  </React.StrictMode>
);
