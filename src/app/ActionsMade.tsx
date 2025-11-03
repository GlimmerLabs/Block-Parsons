import { Stack, Button, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useBlockDispatchContext } from "../common/providers/block/BlockDispatchContext.ts";

function formatTime(ms: number) {
  const hours = Math.floor(ms / (3600 * 1000));
  const minutes = Math.floor((ms % (3600 * 1000)) / (60 * 1000));
  const seconds = Math.floor((ms % (60 * 1000)) / 1000);
  const pad = (n: number, z = 2) => n.toString().padStart(z, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function ActionsMade() {
  const [count, setCount] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);

  const dispatch = useBlockDispatchContext();

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      setTimeTaken(Date.now() - start);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleCheck = () => {
    setCount((prev) => prev + 1);
  };

  const handleReset = () => {
    dispatch({ type: "RESET" });
  };

  return (
    <Stack spacing={2} alignItems="center" justifyContent="center">
      <Stack direction="row" spacing={2} justifyContent="center">
        <Button onClick={handleCheck} color="secondary">
          Check
        </Button>
        <Button onClick={handleReset}>Reset</Button>
      </Stack>
      <Typography>Attempts: {count}</Typography>
      <Typography>Time Taken: {formatTime(timeTaken)}</Typography>
    </Stack>
  );
}
