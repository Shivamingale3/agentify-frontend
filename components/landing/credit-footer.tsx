export default function CreditFooter() {
  return (
    <footer className="relative z-20 border-t border-border bg-background">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-10 flex flex-col md:flex-row gap-6 md:items-end md:justify-between">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="label-eyebrow">Agentify · speculative concept</span>
            <span className="badge border border-border-strong text-muted-foreground">
              Coming soon
            </span>
          </div>
          <span className="font-sans font-bold uppercase text-foreground text-xl leading-none tracking-wide">
            Ship an agent, not a chatbot.
          </span>
        </div>
        <div className="flex flex-col gap-1 md:items-end text-xs text-muted-foreground">
          <span>
            3D head asset ·{" "}
            <a
              href="https://sketchfab.com/3d-models/ghost-in-the-shell-cyborg-head-7a3ad0a509a746b5acaf206d638a2d8a"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-border underline-offset-4 hover:text-foreground"
            >
              &ldquo;Ghost in the Shell Cyborg Head&rdquo;
            </a>{" "}
            by{" "}
            <a
              href="https://sketchfab.com/nikars"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-border underline-offset-4 hover:text-foreground"
            >
              PolyBoi
            </a>
          </span>
          <span>
            licensed under{" "}
            <a
              href="http://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-border underline-offset-4 hover:text-foreground"
            >
              CC-BY-4.0
            </a>
            .
          </span>
        </div>
      </div>
    </footer>
  );
}
