"use client";

import { useTheme } from "next-themes";
import IconLogo from "./icon-logo";

export type LogoSize =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl";

export type LogoMode = "portrait" | "landscape" | "icon";

interface LogoProps {
  size?: LogoSize;
  mode?: LogoMode;
  className?: string;
}

const sizeConfig: Record<
  LogoSize,
  {
    title: string;
    tagline: string;
    landscapeGap: string;
    portraitGap: string;
    textGap: string;
  }
> = {
  xs: {
    title: "text-xs font-bold leading-none tracking-wider",
    tagline: "text-[8px] font-bold leading-none tracking-wider text-muted-foreground",
    landscapeGap: "gap-1.5",
    portraitGap: "gap-1",
    textGap: "gap-0.5",
  },
  sm: {
    title: "text-sm font-bold leading-none tracking-wider",
    tagline: "text-[9px] font-bold leading-none tracking-wider text-muted-foreground",
    landscapeGap: "gap-2",
    portraitGap: "gap-1.5",
    textGap: "gap-0.5",
  },
  md: {
    title: "text-base font-bold leading-none tracking-wider",
    tagline: "text-[10px] font-bold leading-none tracking-wider text-muted-foreground",
    landscapeGap: "gap-2.5",
    portraitGap: "gap-2",
    textGap: "gap-1",
  },
  lg: {
    title: "text-xl font-bold leading-none tracking-wider",
    tagline: "text-xs font-bold leading-none tracking-wider text-muted-foreground",
    landscapeGap: "gap-3",
    portraitGap: "gap-2.5",
    textGap: "gap-1",
  },
  xl: {
    title: "text-3xl font-bold leading-none tracking-wider",
    tagline: "text-sm font-bold leading-none tracking-wider text-muted-foreground",
    landscapeGap: "gap-4",
    portraitGap: "gap-3",
    textGap: "gap-1.5",
  },
  "2xl": {
    title: "text-4xl font-bold leading-none tracking-wider",
    tagline: "text-base font-bold leading-none tracking-wider text-muted-foreground",
    landscapeGap: "gap-5",
    portraitGap: "gap-4",
    textGap: "gap-2",
  },
  "3xl": {
    title: "text-5xl font-bold leading-none tracking-wider",
    tagline: "text-lg font-bold leading-none tracking-wider text-muted-foreground",
    landscapeGap: "gap-6",
    portraitGap: "gap-5",
    textGap: "gap-2.5",
  },
  "4xl": {
    title: "text-6xl font-bold leading-none tracking-wider",
    tagline: "text-xl font-bold leading-none tracking-wider text-muted-foreground",
    landscapeGap: "gap-8",
    portraitGap: "gap-6",
    textGap: "gap-3",
  },
  "5xl": {
    title: "text-7xl font-bold leading-none tracking-wider",
    tagline: "text-2xl font-bold leading-none tracking-wider text-muted-foreground",
    landscapeGap: "gap-10",
    portraitGap: "gap-8",
    textGap: "gap-3.5",
  },
};

const Logo = ({ size = "xs", mode = "portrait", className = "" }: LogoProps) => {
  const { theme } = useTheme();
  const currentColour = theme === "light" ? "#000" : "#fff";
  const config = sizeConfig[size] || sizeConfig.xs;

  if (mode === "icon") {
    return (
      <div className={`inline-flex shrink-0 items-center justify-center ${className}`}>
        <IconLogo currentColour={currentColour} size={size} />
      </div>
    );
  }

  const isPortrait = mode === "portrait";

  return (
    <div
      className={`inline-flex ${
        isPortrait ? "flex-col items-center justify-center " + config.portraitGap : "flex-row items-center justify-center " + config.landscapeGap
      } bg-transparent ${className}`}
    >
      <div className="shrink-0 inline-flex items-center justify-center">
        <IconLogo currentColour={currentColour} size={size} />
      </div>
      <div
        className={`flex flex-col justify-center ${
          isPortrait ? "items-center text-center" : "items-start text-left"
        } ${config.textGap}`}
      >
        <h1 className={`text-foreground ${config.title}`}>
          {(process.env.NEXT_PUBLIC_APP_NAME || "AGENTIFY").toUpperCase()}
        </h1>
        <h5 className={config.tagline}>
          {(
            process.env.NEXT_PUBLIC_APP_TAG_LINE ||
            "SHIP AN AGENT, NOT A CHATBOT"
          ).toUpperCase()}
        </h5>
      </div>
    </div>
  );
};

export default Logo;
