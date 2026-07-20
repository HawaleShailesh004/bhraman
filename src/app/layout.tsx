import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { fontVariables } from "@/lib/fonts";
import { isClerkEnabled } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bhraman - The Sahyadris, minus the guesswork",
  description:
    "Verified Maharashtra adventure operators, honest weather calls, and payments held until you're back. Plan with AI and book trips you can actually trust.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const body = (
    <body className={`${fontVariables} font-body antialiased`}>
      <SmoothScroll />
      <ToastProvider>{children}</ToastProvider>
    </body>
  );

  return (
    <html lang="en">
      <head>
        {/* Satoshi - body UI (Fontshare / Indian Type Foundry) */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap"
          rel="stylesheet"
        />
      </head>
      {isClerkEnabled() ? (
        <ClerkProvider
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          afterSignOutUrl="/"
          localization={{
            signIn: {
              start: {
                title: "Sign in to Bhraman",
                subtitle: "Verified Maharashtra trips - travelers & operators.",
              },
            },
            signUp: {
              start: {
                title: "Join Bhraman",
                subtitle: "Create your account to book or list adventures.",
              },
            },
          }}
        >
          {body}
        </ClerkProvider>
      ) : (
        body
      )}
    </html>
  );
}
