import { Box, Button, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useBlockDispatchContext } from "../common/providers/block/BlockDispatchContext.ts";
import { useBlockContext } from "../common/providers/block/BlockContext.ts";
import { ScamperOutput } from "./ScamperOutput.tsx";

function formatTime(ms: number) {
  const hours = Math.floor(ms / (3600 * 1000));
  const minutes = Math.floor((ms % (3600 * 1000)) / (60 * 1000));
  const seconds = Math.floor((ms % (60 * 1000)) / 1000);
  const pad = (n: number, z = 2) => n.toString().padStart(z, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function Statistics() {
  const [count, setCount] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);

  const {
    solution: { isCorrect, code },
  } = useBlockContext();
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

  const handleCheck = useCallback(() => {
    setCount((prev) => prev + 1);
    dispatch({ type: "CHECK" });
  }, [dispatch]);

  const handleReset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, [dispatch]);

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
      {isCorrect !== null && (
        <Stack direction={"row"} spacing={2}>
          <Box
            bgcolor={isCorrect ? "lightgreen" : "tomato"}
            padding={"0.5em"}
            borderRadius={"0.5em"}
          >
            <Typography>{isCorrect ? "Correct" : "Incorrect"}</Typography>
          </Box>
          {code !== null && !isCorrect && (
            <ScamperOutput key={code} src={code} />
          )}
        </Stack>
      )}
    </Stack>
  );
}
