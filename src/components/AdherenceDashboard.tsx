'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, Tooltip as RechartsTooltip } from 'recharts';
import type { AdherenceStats, DoseLog } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo } from 'react';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { subDays, format, parseISO } from 'date-fns';

interface AdherenceDashboardProps {
  stats: AdherenceStats;
  logs: DoseLog[];
}

const chartConfig = {
  taken: {
    label: "Taken",
    color: "hsl(var(--primary))",
  },
  skipped: {
    label: "Skipped",
    color: "hsl(var(--destructive))",
  }
} satisfies ChartConfig;

export default function AdherenceDashboard({ stats, logs }: AdherenceDashboardProps) {
  const chartData = useMemo(() => {
    const data: { date: string; taken: number; skipped: number }[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dateString = format(date, 'yyyy-MM-dd');
      const dayLogs = logs.filter(log => format(parseISO(log.actionTime), 'yyyy-MM-dd') === dateString);
      
      data.push({
        date: format(date, 'eee'),
        taken: dayLogs.filter(l => l.status === 'taken').length,
        skipped: dayLogs.filter(l => l.status === 'skipped').length
      });
    }
    return data;
  }, [logs]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adherence Summary</CardTitle>
        <CardDescription>Your 30-day adherence rate.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-center gap-2 mb-6 text-center">
            <p className="text-5xl font-bold tracking-tight text-primary">
                {stats.adherencePercentage}%
            </p>
        </div>
        <ChartContainer config={chartConfig} className="h-[120px] w-full">
            <ResponsiveContainer>
                <BarChart accessibilityLayer data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                    <RechartsTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                    <Bar dataKey="taken" fill="var(--color-taken)" radius={4} stackId="a" />
                    <Bar dataKey="skipped" fill="var(--color-skipped)" radius={4} stackId="a" />
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
