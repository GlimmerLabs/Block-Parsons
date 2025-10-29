// src/common/dnd-wrappers/AccessibleDraggable.tsx
import { Box } from "@mui/material";
import { useDraggable } from "@dnd-kit/core";
import { useRef, useState, type PropsWithChildren } from "react";
import type { DragDropProps } from "./dnd-props";

type Props = PropsWithChildren<
  DragDropProps & {
    ariaLabel?: string; // override for screen readers
  }
>;

//export function AccessibleDraggable({ id, children, ariaLabel }: Props) {
  //const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });
  const [announcement, setAnnouncement] = useState("");
  const [isSelected, setIsSelected] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const speak = (msg: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel(); // avoid queue pile-up
    const u = new SpeechSynthesisUtterance(msg);
    u.rate = 1;
    window.speechSynthesis.speak(u);
  };

//}
