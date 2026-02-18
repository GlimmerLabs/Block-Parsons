import { Box } from "@mui/material";
import { Scamper } from "scamper/src";
import { useEffect, useRef, useState } from "react";
import { mkOptions } from "scamper/src/scamper.ts";

interface ScamperOutputProps {
  src: string;
}

export function ScamperOutput({ src }: ScamperOutputProps) {
  const elementRef = useRef<HTMLElement | null>(null);
  const [scamper, setScamper] = useState<Scamper | null>(null);

  useEffect(() => {
    if (elementRef.current === null) return;
    if (scamper === null) {
      setScamper(new Scamper(elementRef.current, src, mkOptions()));
      return;
    }
    console.log(scamper.sem.isFinished());
    scamper.runProgram();
  }, [scamper, src]);

  return <Box ref={elementRef} />;
}
