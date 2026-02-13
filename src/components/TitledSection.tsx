import type { PropsWithChildren } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { useDroppable } from "@dnd-kit/core";

interface TitledSectionProps {
  title: string;
}

export function TitledSection({
  title,
  children,
}: PropsWithChildren<TitledSectionProps>) {
  const { setNodeRef } = useDroppable({ id: title });
  return (
    <Stack spacing={2} ref={setNodeRef}>
      <Typography variant="h6">{title}</Typography>
      <Box border={2} borderRadius={"0.5em"} padding={"10px"} flexGrow={1}>
        {children}
      </Box>
    </Stack>
  );
}
