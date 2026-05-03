import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { VideoTrayProvider } from "@/context/VideoTrayContext";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CreatorOS - AI Content Studio",
  description: "AI-powered content creation dashboard",
};

const SIDEBAR_W = 260;
const HEADER_H  = 64;
const CONTENT_TOP_GAP = 24;   // tighter — header is only 64px, no need for 32px extra
const CONTENT_SIDE_GAP = 28;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ margin: 0, padding: 0, background: "#0f0f23", overflowX: "hidden" }}
      >
        <VideoTrayProvider>
          <Sidebar />
          <Header />
          {/*
            Push content RIGHT of fixed sidebar, DOWN below fixed header.
            Use individual padding props — never shorthand (avoids paddingTop override bug).
          */}
          <main
            style={{
              marginLeft: `${SIDEBAR_W}px`,
              paddingTop: `${HEADER_H + CONTENT_TOP_GAP}px`,
              paddingRight: `${CONTENT_SIDE_GAP}px`,
              paddingBottom: `${CONTENT_SIDE_GAP}px`,
              paddingLeft: `${CONTENT_SIDE_GAP}px`,
              minHeight: "100vh",
              boxSizing: "border-box",
              width: `calc(100vw - ${SIDEBAR_W}px)`,
            }}
          >
            {children}
          </main>
        </VideoTrayProvider>
      </body>
    </html>
  );
}
