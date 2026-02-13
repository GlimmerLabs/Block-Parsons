import { Stack } from "@mui/material";
import { TitledSection } from "./TitledSection.tsx";
import { BlockLibrary } from "./block-library/BlockLibrary.tsx";
import { SolutionBox } from "./solution-box/SolutionBox.tsx";
import { SectionTitles } from "../common/utils.ts";
import { Statistics } from "./Statistics.tsx";
import { Attribution } from "./Attribution.tsx";

export function MainContent() {
  return (
    <Stack spacing={2} alignItems="center" justifyContent="center">
      <Stack direction="row" spacing={2} justifyContent="center">
        <TitledSection title={SectionTitles.BlockLibrary}>
          <BlockLibrary />
        </TitledSection>
        <TitledSection title={SectionTitles.SolutionBox}>
          <SolutionBox />
        </TitledSection>
      </Stack>
      <Statistics />
      <Attribution />
    </Stack>
  );
}
