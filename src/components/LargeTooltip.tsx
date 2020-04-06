import React, { FunctionComponent, useRef, ReactNode } from "react";
import ReactDOM from "react-dom";

import { absoluteBounds } from "../utils/dom";

import "./LargeTooltip.css";

let root = document.getElementsByTagName("body").item(0)!;

export interface LargeTooltipParams {
  show: boolean;
  tip: string | ReactNode;
}

export const LargeTooltip: FunctionComponent<LargeTooltipParams> = ({
  show,
  tip,
  children
}) => {
  const myself = useRef<HTMLDivElement>(null);
  let position;
  if (myself.current) {
    const bounds = absoluteBounds(myself.current);
    position = {
      top: bounds.top,
      left: bounds.left + bounds.width
    };
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
