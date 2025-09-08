'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { suggestSchedule, type SuggestScheduleInput, type SuggestScheduleOutput } from '@/ai/flows/smart-schedule-suggestions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wand2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Medication, DoseLog } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  medicationId: z.string().min(1, 'Please select a medication.'),
  userDailyRoutine: z.string().min(10, 'Please describe your daily routine in a bit more detail.'),
});

type SmartScheduleFormValues = z.infer<typeof formSchema>;

interface SmartScheduleDialogProps {
    medications: Medication[];
    adherenceData: DoseLog[];
}

export default function SmartScheduleDialog({ medications, adherenceData }: SmartScheduleDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SuggestScheduleOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<SmartScheduleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      medicationId: '',
      userDailyRoutine: 'I wake up around 7 AM, work from 9 AM to 5 PM, have dinner at 7 PM, and go to bed around 11 PM.',
    },
  });

  async function onSubmit(values: SmartScheduleFormValues) {
    setLoading(true);
    setResult(null);
    try {
      const selectedMed = medications.find(m => m.id === values.medicationId);
      if (!selectedMed) {
        throw new Error('Medication not found.');
      }

      const adherenceSummary = `User has taken ${adherenceData.filter(d => d.status === 'taken' && d.medicationId === values.medicationId).length} doses and skipped ${adherenceData.filter(d => d.status === 'skipped' && d.medicationId === values.medicationId).length} doses for ${selectedMed.name}.`;

      const input: SuggestScheduleInput = {
        medicationName: selectedMed.name,
        currentSchedule: `Daily at ${selectedMed.schedule.times.join(', ')}`,
        adherenceData: adherenceSummary,
        userDailyRoutine: values.userDailyRoutine,
      };

      const suggestion = await suggestSchedule(input);
      setResult(suggestion);
    } catch (error) {
      console.error('Error suggesting schedule:', error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Could not generate a smart schedule suggestion. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Wand2 className="text-accent" />
            Smart Schedule
        </CardTitle>
        <CardDescription>Let AI help you find a better medication schedule.</CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" variant="outline">
              Get Suggestions
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Smart Schedule Suggestion</DialogTitle>
              <DialogDescription>
                Describe your routine and let AI optimize your medication reminders.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="medicationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medication</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a medication" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {medications.map(med => (
                            <SelectItem key={med.id} value={med.id}>{med.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="userDailyRoutine"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Daily Routine</FormLabel>
                      <FormControl>
                        <Textarea rows={4} placeholder="e.g., I wake up at 7 AM..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                  Generate Suggestion
                </Button>
              </form>
            </Form>
            {result && (
              <Alert className="mt-4 bg-accent/10">
                <Wand2 className="h-4 w-4" />
                <AlertTitle className="font-bold">Suggestion for you!</AlertTitle>
                <AlertDescription className="space-y-2">
                    <p><strong>New Schedule:</strong> {result.suggestedSchedule}</p>
                    <p><strong>Reasoning:</strong> {result.explanation}</p>
                </AlertDescription>
              </Alert>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
