import { Button, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useState, useMemo } from "react";
import { useBlockDispatchContext } from "../../common/providers/block/BlockDispatchContext.ts";
import { useBlockContext } from "../../common/providers/block/BlockContext.ts";
import { SafeScamperOutput } from "./SafeScamperOutput.tsx";

function formatTime(ms: number) {
  const hours = Math.floor(ms / (3600 * 1000));
  const minutes = Math.floor((ms % (3600 * 1000)) / (60 * 1000));
  const seconds = Math.floor((ms % (60 * 1000)) / 1000);
  const pad = (n: number, z = 2) => n.toString().padStart(z, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function Tools() {
  const [count, setCount] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);

  const {
    solution: { isCorrect, isComplete, code, errorMessage },
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

  const handleFeedback = useMemo(() => {
    if (isCorrect === null) return null;

    if (isCorrect) {
      return {
        color: "success",
        title: "Good job!",
        message: "You have solved the problem!",
      } as const;
    }
    if (!isComplete) {
      return {
        color: "warning",
        title: "Incomplete",
        message: "Try to construct a solution using all blocks!",
      } as const;
    }

    return {
      color: "error",
      title: "Incorrect",
      message: errorMessage || "The solution is incorrect. Please try again.",
    } as const;
  }, [isComplete, isCorrect, errorMessage]);

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
      {handleFeedback !== null && (
        <Stack direction={"row"} spacing={2} justifyContent={"center"}>
          <Typography
            sx={{
              bgcolor:
                handleFeedback.color === "success"
                  ? "rgba(144, 238, 144, 0.3)"
                  : handleFeedback.color === "warning"
                    ? "rgba(255, 165, 0, 0.3)"
                    : "rgba(255, 99, 71, 0.3)",
              padding: "0.5em",
              borderRadius: "0.5em",
              height: "fit-content",
            }}
          >
            <Typography fontWeight="bold">{handleFeedback.title}</Typography>
            <Typography>{handleFeedback.message} </Typography>
          </Typography>
          {code !== null && !isCorrect && (
            <SafeScamperOutput key={code} src={code} />
          )}
        </Stack>
      )}
    </Stack>
  );
}
