'use client';

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { Project } from '@/lib/data';

type ProjectStatusChartProps = {
  projects: Project[];
};

const chartConfig = {
  progress: {
    label: 'Progress',
  },
};

export function ProjectStatusChart({ projects }: ProjectStatusChartProps) {
  const statusColors: Record<Project['status'], string> = {
    'On Track': 'hsl(var(--chart-1))',
    'At Risk': 'hsl(var(--destructive))',
    Completed: 'hsl(var(--chart-3))',
  };

  const chartData = projects.map((p) => ({
    ...p,
    fill: statusColors[p.status],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Progress</CardTitle>
        <CardDescription>
          An overview of current project completion percentages.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[250px]">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              dataKey="progress"
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(label, payload) =>
                    payload?.[0]?.payload.name ?? label
                  }
                  formatter={(value) => [`${value}%`, 'Progress']}
                  indicator="dot"
                />
              }
            />
            <Bar dataKey="progress" radius={8}>
              {chartData.map((entry) => (
                <Cell key={`cell-${entry.id}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
