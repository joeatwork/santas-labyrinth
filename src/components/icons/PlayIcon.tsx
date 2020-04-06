import React from "react";

export function PlayIcon() {
  // Something in the build chain can't handle
  // this (and apparently *only* this) svg tag if there
  // are line breaks in it. Other nearly identical files
  // are unaffected. We just put this band-aid on it
  // and move on.

  // prettier-ignore
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" >
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
    </svg>
  );
}
