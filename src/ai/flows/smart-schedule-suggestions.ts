'use server';

/**
 * @fileOverview A smart schedule suggestion AI agent.
 *
 * - suggestSchedule - A function that suggests an optimized medication schedule.
 * - SuggestScheduleInput - The input type for the suggestSchedule function.
 * - SuggestScheduleOutput - The return type for the suggestSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestScheduleInputSchema = z.object({
  medicationName: z.string().describe('The name of the medication.'),
  currentSchedule: z.string().describe('The current medication schedule.'),
  adherenceData: z
    .string()
    .describe(
      'A summary of the user medication adherence history, including the number of doses taken and skipped, and the times when doses were taken.  Include any information about the user daily routine that might be relevant.'
    ),
  userDailyRoutine: z
    .string()
    .describe('A description of the user daily routine.'),
});
export type SuggestScheduleInput = z.infer<typeof SuggestScheduleInputSchema>;

const SuggestScheduleOutputSchema = z.object({
  suggestedSchedule: z
    .string()
    .describe(
      'A suggested medication schedule, optimized for the user adherence patterns and daily routine.'
    ),
  explanation: z
    .string()
    .describe(
      'An explanation of why the suggested schedule is better than the current schedule.'
    ),
});
export type SuggestScheduleOutput = z.infer<typeof SuggestScheduleOutputSchema>;

export async function suggestSchedule(input: SuggestScheduleInput): Promise<SuggestScheduleOutput> {
  return suggestScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSchedulePrompt',
  input: {schema: SuggestScheduleInputSchema},
  output: {schema: SuggestScheduleOutputSchema},
  prompt: `You are an AI medication adherence assistant. You will analyze the user medication adherence patterns and suggest optimized reminder schedules, taking into account the user daily routines and past adherence behavior, so that the user can improve their medication adherence.

Medication Name: {{{medicationName}}}
Current Schedule: {{{currentSchedule}}}
Adherence Data: {{{adherenceData}}}
User Daily Routine: {{{userDailyRoutine}}}

Based on this information, suggest an optimized medication schedule and explain why it is better than the current schedule.

Be sure to take into account factors such as:

* The user daily routine.
* The user past adherence behavior.
* The medication properties.

Ensure to suggest a schedule that is realistic and achievable for the user.
`,
});

const suggestScheduleFlow = ai.defineFlow(
  {
    name: 'suggestScheduleFlow',
    inputSchema: SuggestScheduleInputSchema,
    outputSchema: SuggestScheduleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
