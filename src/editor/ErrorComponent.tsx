import React, { ReactNode } from "react";

interface ErrorComponentProps {
  offsetKey: string;
  children: ReactNode;
}

export function ErrorComponent({ offsetKey, children }: ErrorComponentProps) {
  return (
    <span data-offset-key={offsetKey} style={{ backgroundColor: "pink" }}>
      {children}
    </span>
  );
}
