import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // react-hooks/immutability and react-hooks/purity model "the rules of
    // react" for typical state-driven components — mutating a value derived
    // from a hook, calling Math.random() during render, etc. react-three-fiber
    // fundamentally doesn't fit that model: useFrame is an explicit escape
    // hatch for per-frame *imperative* mutation of Three.js objects that live
    // outside React's render cycle, and useMemo here is memoizing a scene
    // traversal, not deriving render output. A "use no memo" directive keeps
    // React Compiler from attempting to transform these files, but doesn't
    // silence these two static-analysis rules, so scope the rules off here
    // instead of disabling them (or the compiler) project-wide.
    files: ["components/landing/bot-scene/**/*.tsx", "lib/bot/**/*.ts"],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/purity": "off",
    },
  },
]);

export default eslintConfig;
