import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Break from "./pages/Break";
import Breaker from "./pages/Breaker";
import Docs from "./pages/Docs";
import FAQ from "./pages/FAQ";
import Terms from "./pages/Terms";
import Whitepaper from "./pages/Whitepaper";
import Agent from "./pages/Agent";
import JailTokens from "./pages/JailTokens";
import Agents from "./pages/Agents";
import Breakers from "./pages/Breakers";
import SocialBounties from "./pages/SocialBounties";
import SocialBounty from "./pages/SocialBounty";
import CreateCharacterPage from "./pages/CreateCharacterPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/break/:name",
    element: <Break />,
  },
  {
    path: "/breaker/:address",
    element: <Breaker />,
  },
  {
    path: "/agent/:name",
    element: <Agent />,
  },
  {
    path: "/docs",
    element: <Docs />,
  },
  {
    path: "/faq",
    element: <FAQ />,
  },
  {
    path: "/terms",
    element: <Terms />,
  },
  // {
  //   path: "/whitepaper",
  //   element: <Whitepaper />,
  // },
  {
    path: "/jail-tokens",
    element: <JailTokens />,
  },
  {
    path: "/agents",
    element: <Agents />,
  },
  {
    path: "/breakers",
    element: <Breakers />,
  },
  {
    path: "/jailx",
    element: <SocialBounties />,
  },
  {
    path: "/jailx/:id",
    element: <SocialBounty />,
  },
  // {
  //   path: "/launch-eliza",
  //   element: <CreateCharacterPage />,
  // },
]);
