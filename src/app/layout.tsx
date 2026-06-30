import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "@fontsource/archivo/400.css";
import "@fontsource/archivo/500.css";
import "@fontsource/archivo/600.css";
import "@fontsource/archivo/700.css";
import "@fontsource/archivo/800.css";
import "@fontsource/archivo/900.css";
import "@fontsource/fraunces/500-italic.css";
import "@fontsource/fraunces/600.css";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { fontVariables } from "@/lib/fonts";
import { isClerkEnabled } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bhraman - Maharashtra's wild, made bookable",
  description:
    "A trust-first marketplace connecting weekend adventurers with verified local operators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const body = (
    <body className={fontVariables}>
      <ToastProvider>{children}</ToastProvider>
    </body>
  );

  return (
    <html lang="en">
      {isClerkEnabled() ? (
        <ClerkProvider
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          afterSignOutUrl="/"
        >
          {body}
        </ClerkProvider>
      ) : (
        body
      )}
    </html>
  );
}
