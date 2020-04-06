export function absoluteBounds(el: HTMLElement) {
  const rect = el.getBoundingClientRect()!;
  const frame = el.ownerDocument!.defaultView!;
  return {
    top: rect.top + frame.pageYOffset,
    left: rect.left + frame.pageXOffset,
    width: rect.width,
    height: rect.height
  };
}
