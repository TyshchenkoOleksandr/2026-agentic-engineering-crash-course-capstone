import type {
  CompositeOver,
  ContrastRatio,
  LastShadowColor,
  ParseCssColor,
  RelativeLuminance,
} from "@/lib/game/types";

// Presentation maths (design D18): pure colour helpers shared by the e2e contrast assertions.
// No React, no DOM, no network — only numbers and strings.

export const parseCssColor: ParseCssColor = () => {
  throw new Error("not implemented");
};

export const compositeOver: CompositeOver = () => {
  throw new Error("not implemented");
};

export const relativeLuminance: RelativeLuminance = () => {
  throw new Error("not implemented");
};

export const contrastRatio: ContrastRatio = () => {
  throw new Error("not implemented");
};

export const lastShadowColor: LastShadowColor = () => {
  throw new Error("not implemented");
};
