import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { memo, type ReactNode } from "react";
import { ScamperOutput } from "./ScamperOutput.tsx";
import type { ScamperError } from "scamper/src/lang.ts";
import type { ContractHint } from "scamper/src/contract.ts";
import { Stack, Typography } from "@mui/material";

interface StrictContractHint extends ContractHint {
  expected: ContractHint["expected"];
  actual: NonNullable<ContractHint["actual"]>;
}
function isStrictContractHint(hint: ContractHint): hint is StrictContractHint {
  return hint.actual !== undefined;
}

const NoExplanation = `Sorry, I can't explain this error yet.
If you need help, please reach out to your instructors or peer mentors!`;
const ContractViolationExplanation = (
  source: string,
  { expected, actual }: StrictContractHint,
) =>
  `The ${source} function wanted a ${expected} as an argument.
You gave it a ${actual} instead.`;

function explainScamperError({ data, source }: ScamperError): string {
  if (!data) return NoExplanation;
  const { type, hint } = data;
  switch (type) {
    // TODO: when we add more error types, we don't need to suppress eslint
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    case "Contract": {
      if (!source || !isStrictContractHint(hint)) return NoExplanation;
      return ContractViolationExplanation(source, hint);
    }
    default: {
      return NoExplanation;
    }
  }
}

const ScamperErrorInterpreter: (props: FallbackProps) => ReactNode = ({
  error,
}) => {
  if (!Array.isArray(error)) return <>{(error as Error).message}</>;
  const errs = error as ScamperError[];
  return (
    <Stack bgcolor={"grey"} padding={1} borderRadius={"0.4em"} maxWidth={"50%"}>
      {errs.map((err) => (
        <Stack
          spacing={1}
          bgcolor={"lightgrey"}
          padding={1}
          borderRadius={"0.4em"}
        >
          <Typography sx={{ whiteSpace: "pre-line" }}>
            {explainScamperError(err)}
          </Typography>
          <Stack direction={"row"} spacing={1} alignItems={"center"}>
            <Typography>Error:</Typography>
            <Typography
              fontFamily={"monospace"}
              sx={{ wordWrap: "break-word" }}
              maxWidth={"100%"}
              bgcolor={"white"}
              padding={1}
              borderRadius={"0.4em"}
            >
              {err.toString()}
            </Typography>
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
};

interface SafeScamperOutputProps {
  src: string;
}

// TODO: memo isn't necessary if/when we move to react compiler
export const SafeScamperOutput = memo(function SafeScamperOutput({
  src,
}: SafeScamperOutputProps) {
  return (
    <ErrorBoundary fallbackRender={ScamperErrorInterpreter}>
      <ScamperOutput key={src} src={src} />
    </ErrorBoundary>
  );
});
