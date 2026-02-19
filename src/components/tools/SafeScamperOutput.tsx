import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { memo, type ReactNode } from "react";
import { ScamperOutput } from "./ScamperOutput.tsx";
import type { ScamperError } from "scamper/src/lang.ts";

const ScamperErrorInterpreter: (props: FallbackProps) => ReactNode = ({
  error,
}) => {
  if (!Array.isArray(error)) return <>{(error as Error).message}</>;
  const errs = error as ScamperError[];
  return (
    <>
      {errs.map(({ message, data, source }) => (
        <>
          <>{message + "\n"}</>
          <>
            {data &&
              `${source ?? "no source"} ${data.hint.expected} ${data.hint.actual ? data.hint.actual : "no actual"}`}
          </>
        </>
      ))}
    </>
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
