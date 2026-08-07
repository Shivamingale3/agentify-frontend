import type { Metadata } from "next";
import LandingPage from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "Botify — ship an agent, not a chatbot.",
  description:
    "Assemble a real agentic bot in a minute — persona, knowledge, tools, embed one line of HTML. For sales teams that ship leads to CRM, calendars, and DB without writing code.",
  openGraph: {
    title: "Botify — ship an agent, not a chatbot.",
    description:
      "Persona. Knowledge. Tools. One embed line. No code. No reinstall.",
    type: "website",
  },
};

export default function Home() {
  return <LandingPage />;
}
