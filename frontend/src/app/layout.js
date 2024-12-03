import { Inter } from "next/font/google";
import Script from "next/script";

import "./globals.css";
import ClientWalletProvider from "./providers/WalletProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Jailbreak",
  description: "Jailbreak",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="./favicon.ico" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="./favicon.ico" />
        <link rel="apple-touch-icon" href="./favicon.ico" />
      </head>
      {/* Global Site Tag (gtag.js) - Google Analytics */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=G-DB2VF4K2JN`}
      />
      <Script
        id="ga-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-DB2VF4K2JN', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      <body className={inter.className}>
        <ClientWalletProvider>{children}</ClientWalletProvider>
      </body>
    </html>
  );
}
