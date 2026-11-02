// Adaptado dos controles nativos do Frequência Hub e de coss ui (MIT).
// Origem e licença em docs/THIRD-PARTY-UI.md.
import type { ComponentProps } from "react";

export function Frame(props: ComponentProps<"div">) {
  return <div data-slot="frame" className="ui-frame" {...props} />;
}

export function FrameHeader(props: ComponentProps<"div">) {
  return <div data-slot="frame-header" className="ui-frame-header" {...props} />;
}

export function FramePanel(props: ComponentProps<"div">) {
  return <div data-slot="frame-panel" className="ui-frame-panel" {...props} />;
}

export function SegmentedControl(props: ComponentProps<"div">) {
  return <div role="group" className="ui-segmented" {...props} />;
}

export function SegmentedControlItem({
  selected,
  ...props
}: ComponentProps<"button"> & { selected: boolean }) {
  return <button type="button" aria-pressed={selected} {...props} />;
}
