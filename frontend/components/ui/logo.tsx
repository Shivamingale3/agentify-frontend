"use client";

import { useTheme } from "next-themes";
import IconLogo from "./icon-logo";

const Logo = ({
  size = "xs",
  mode = "portrait",
}: {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  mode?: "portrait" | "landscape" | "icon";
}) => {
  const { theme } = useTheme();
  let currentColour = "#fff";
  if (theme === "light") {
    currentColour = "#000";
  }

  if (mode === "icon") {
    return <IconLogo currentColour={currentColour} size={size} />;
  }

  return (
    <div
      className={`${mode === "portrait" ? "flex-col" : "flex-row"} flex bg-transparent justify-center items-center`}
    >
      <IconLogo currentColour={currentColour} size={size} />
      <div
        className={`flex flex-col ${mode === "portrait" ? "justify-center items-center" : "justify-start items-start"} gap-1`}
      >
        <h1 className="text-2xl font-bold text-foreground">
          {process.env.NEXT_PUBLIC_APP_NAME?.toUpperCase()}
        </h1>
        <h5 className="text-xs font-bold text-foreground">
          {process.env.NEXT_PUBLIC_APP_TAG_LINE?.toUpperCase()}
        </h5>
      </div>
    </div>
  );
};

export default Logo;
