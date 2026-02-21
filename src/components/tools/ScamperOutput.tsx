import { Box } from "@mui/material";
import { Scamper } from "scamper/src";
import { useEffect, useRef } from "react";
import { mkOptions } from "scamper/src/scamper.ts";
import { useErrorBoundary } from "react-error-boundary";

interface ScamperOutputProps {
  src: string;
}

export function ScamperOutput({ src }: ScamperOutputProps) {
  const elementRef = useRef<HTMLElement | null>(null);
  const scamperRef = useRef<Scamper | null>(null);

  const { showBoundary } = useErrorBoundary();

  useEffect(() => {
    if (elementRef.current === null) return;
    const element = elementRef.current;
    try {
      if (scamperRef.current === null) {
        scamperRef.current = new Scamper(element, src, mkOptions());
      }
      const scamper = scamperRef.current;
      console.log(scamper.sem.isFinished());
      scamper.sem.executeUnsafely();
    } catch (errs) {
      showBoundary(errs);
    }

    return () => {
      scamperRef.current = null;
      element.innerHTML = "";
    };
  }, [showBoundary, src]);

  return <Box ref={elementRef} />;
}
