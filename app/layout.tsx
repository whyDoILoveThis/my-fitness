import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Nav from "@/components/Nav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My Fitness Iota",
  description: "A wrokout tracker with color coded habbit tracking calendars",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html className="flex flex-col items-center justify-center" lang="en">
        <SignedOut>
          <body
            className={`max-w-[500px] flex flex-col justify-center items-center h-screen ${inter.className}`}
          >
            <p>Track your habits and count reps</p>
            <p className="border w-fit hover:bg-white hover:bg-opacity-10 p-1 px-4 rounded-full mt-2">
              <SignInButton />
            </p>
          </body>
        </SignedOut>
        <SignedIn>
          <body
            className={`max-w-[500px] flex flex-col items-center ${inter.className}`}
          >
            <div className="fixed flex flex-col items-center gap-2 border p-2 mt-2 rounded-xl border-white border-opacity-20 bg-black bg-opacity-10 bg-blur">
              <UserButton />
              <Nav />
            </div>
            <div className=" pt-28">{children} </div>
          </body>
        </SignedIn>
      </html>
    </ClerkProvider>
  );
}
