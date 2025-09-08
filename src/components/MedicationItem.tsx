'use client';

import { useState, useEffect } from 'react';
import type { Medication } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pill, FlaskConical, Syringe, HelpCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';

interface MedicationItemProps {
  medication: Medication;
  onLogDose: (medicationId: string, status: 'taken' | 'skipped') => void;
}

const formIcons: Record<Medication['form'], React.ReactNode> = {
  pill: <Pill className="h-5 w-5" />,
  liquid: <FlaskConical className="h-5 w-5" />,
  injection: <Syringe className="h-5 w-5" />,
  other: <HelpCircle className="h-5 w-5" />,
};

export default function MedicationItem({ medication, onLogDose }: MedicationItemProps) {
  const [nextDose, setNextDose] = useState<Date | null>(null);

  useEffect(() => {
    const now = new Date();
    const upcomingTimes = medication.schedule.times
      .map(time => {
        const [hours, minutes] = time.split(':').map(Number);
        const doseTime = new Date();
        doseTime.setHours(hours, minutes, 0, 0);
        return doseTime;
      })
      .filter(doseTime => doseTime > now)
      .sort((a, b) => a.getTime() - b.getTime());
    
    if (upcomingTimes.length > 0) {
      setNextDose(upcomingTimes[0]);
    } else {
      // If no more doses today, find the first dose for tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      const [hours, minutes] = medication.schedule.times[0].split(':').map(Number);
      tomorrow.setHours(hours, minutes, 0, 0);
      setNextDose(tomorrow);
    }
  }, [medication.schedule.times]);
  
  return (
    <Card className="flex flex-col transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2 font-headline">
            {formIcons[medication.form]}
            {medication.name}
          </CardTitle>
          <CardDescription>{medication.dosage}</CardDescription>
        </div>
        <Badge variant="outline">{medication.schedule.type}</Badge>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
                Next Dose: {nextDose ? `${format(nextDose, 'p')} (${format(nextDose, 'MMM d')})` : 'Calculating...'}
            </div>
            {medication.instructions && (
                <TooltipProvider>
                    <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                            <p className="flex items-center gap-1 text-sm text-muted-foreground cursor-help">
                                <Info className="h-4 w-4 text-accent" />
                                <span className="truncate">{medication.instructions}</span>
                            </p>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="max-w-xs">{medication.instructions}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="ghost" onClick={() => onLogDose(medication.id, 'skipped')}>
          Skip
        </Button>
        <Button onClick={() => onLogDose(medication.id, 'taken')}>
          Take Now
        </Button>
      </CardFooter>
    </Card>
  );
}
