export interface TourStep {
  /** Matches a `data-tour="<target>"` attribute somewhere in the document. */
  target: string;
  title: string;
  body: string;
  placement?: "top" | "bottom" | "left" | "right";
}
