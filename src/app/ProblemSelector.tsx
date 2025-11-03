import { Stack, Typography, Card, CardContent, Button, Chip, Box } from "@mui/material";
import { topics } from "../problems/index.ts";
import { DifficultyColors, type Problem } from "../problems/problem-types.ts";
import { useState } from "react";

interface ProblemSelectorProps {
  onSelectProblem: (problemId: string) => void;
}

export function ProblemSelector({ onSelectProblem }: ProblemSelectorProps) {
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  const groupedTopics = topics.reduce((acc, topic) => {
    if (!acc[topic.week]) {
      acc[topic.week] = [];
    }
    acc[topic.week].push(topic);
    return acc;
  }, {} as Record<number, typeof topics>);

  const weeks = Object.keys(groupedTopics).map(Number).sort();

  const renderProblemCard = (problem: Problem) => (
    <Card
      key={problem.id}
      sx={{
        marginBottom: 2,
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 3,
        },
      }}
      onClick={() => onSelectProblem(problem.id)}
    >
      <CardContent>
        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{problem.title}</Typography>
            <Chip
              label={problem.difficulty}
              size="small"
              sx={{
                bgcolor: DifficultyColors[problem.difficulty],
                color: "white",
                fontWeight: "bold",
              }}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {problem.description}
          </Typography>
          {problem.hints && problem.hints.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              💡 {problem.hints.length} hint{problem.hints.length > 1 ? "s" : ""} available
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Stack spacing={3} alignItems="center" sx={{ padding: 3 }}>
      <Typography variant="h4">Block Parsons Problems</Typography>
      <Typography variant="body1" color="text.secondary">
        Select a problem to solve by dragging blocks from the library to construct the correct Scheme expression.
      </Typography>

      {weeks.map((week) => (
        <Box key={week} sx={{ width: "100%", maxWidth: "800px" }}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => setSelectedWeek(selectedWeek === week ? null : week)}
            sx={{ marginBottom: 2 }}
          >
            Week {week}: {groupedTopics[week][0]?.name}
          </Button>

          {selectedWeek === week &&
            groupedTopics[week].map((topic) => (
              <Box key={topic.id} sx={{ marginBottom: 3 }}>
                <Typography variant="h6" sx={{ marginBottom: 2, marginLeft: 2 }}>
                  {topic.name}
                </Typography>
                {topic.problems.map(renderProblemCard)}
              </Box>
            ))}
        </Box>
      ))}
    </Stack>
  );
}

