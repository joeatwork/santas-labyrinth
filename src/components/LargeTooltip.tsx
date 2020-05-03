import React, { FunctionComponent, useRef, ReactNode } from "react";
import ReactDOM from "react-dom";

import { Rect } from "../utils/geometry";
import { absoluteBounds } from "../utils/dom";

import "./LargeTooltip.css";

let root = document.getElementsByTagName("body").item(0)!;

export const rightEdge = (bounds: Rect) => ({
  top: bounds.top,
  left: bounds.left + bounds.width
});

export const below = (bounds: Rect) => ({
  top: bounds.top + bounds.height,
  left: bounds.left + 8
});

export interface LargeTooltipParams {
  show: boolean;
  tip: string | ReactNode;
  offset: (arg: Rect) => { top: number; left: number };
}

export const LargeTooltip: FunctionComponent<LargeTooltipParams> = ({
  show,
  tip,
  offset,
  children
}) => {
  const myself = useRef<HTMLDivElement>(null);
  let position;
  if (myself.current) {
    const bounds = absoluteBounds(myself.current);
    position = offset(bounds);
  }

  return (
    <div className="LargeTooltip-location" ref={myself}>
      {children}
      {show && position
        ? ReactDOM.createPortal(
            <div className="LargeTooltip-container" style={{ ...position }}>
              {tip}
            </div>,
            root
          )
        : ""}
    </div>
  );
};
