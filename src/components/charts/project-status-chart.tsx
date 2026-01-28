'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis, ResponsiveContainer } from 'recharts';

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
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const statusColors: Record<Project['status'], string> = {
    'On Track': 'hsl(var(--chart-1))',
    'At Risk': 'hsl(var(--chart-3))',
    Completed: 'hsl(var(--chart-2))',
  };

  const chartData = projects.map((p) => ({
    ...p,
    fill: statusColors[p.status],
  }));

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg">Project Progress</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Overview of project completion percentages.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        <ChartContainer config={chartConfig} className="h-[180px] sm:h-[280px] md:h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{ 
                top: 5, 
                right: 5, 
                left: 0, 
                bottom: 5 
              }}
              layout="vertical"
              barSize={isMobile ? 10 : 20}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                tickMargin={4}
                axisLine={false}
                width={isMobile ? 50 : 100}
                tick={{ fontSize: isMobile ? 9 : 12 }}
              />
              <XAxis
                type="number"
                dataKey="progress"
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
                hide
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(label, payload) =>
                      payload?.[0]?.payload.name ?? label
                    }
                    formatter={(value, name, item) => (
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.payload.fill }} />
                        <span className="text-xs">{`${value}% - ${item.payload.status}`}</span>
                      </div>
                    )}
                    indicator="dot"
                  />
                }
              />
              <Bar dataKey="progress" radius={3}>
                {chartData.map((entry) => (
                  <Cell key={`cell-${entry.id}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
