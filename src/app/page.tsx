'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Medication, DoseLog, AdherenceStats } from '@/lib/types';
import Header from '@/components/Header';
import MedicationList from '@/components/MedicationList';
import AdherenceDashboard from '@/components/AdherenceDashboard';
import SmartScheduleDialog from '@/components/SmartScheduleDialog';
import ShareDataCard from '@/components/ShareDataCard';
import { AddMedicationDialog } from '@/components/AddMedicationDialog';
import { parseISO } from 'date-fns';

const initialMedications: Medication[] = [
  {
    id: 'med1',
    name: 'Lisinopril',
    dosage: '10mg',
    form: 'pill',
    schedule: { type: 'daily', times: ['08:00'] },
    instructions: 'Take with a full glass of water.',
  },
  {
    id: 'med2',
    name: 'Metformin',
    dosage: '500mg',
    form: 'pill',
    schedule: { type: 'daily', times: ['09:00', '21:00'] },
  },
  {
    id: 'med3',
    name: 'Amoxicillin',
    dosage: '250mg',
    form: 'liquid',
    schedule: { type: 'interval', intervalDays: 1, times: ['07:00', '15:00', '23:00'] },
    instructions: 'Finish the entire course. Shake well before use.',
  },
];

export default function Home() {
  const [medications, setMedications] = useState<Medication[]>(initialMedications);
  const [doseLogs, setDoseLogs] = useState<DoseLog[]>([]);

  useEffect(() => {
    const today = new Date();
    const logs: DoseLog[] = [];
    // Generate logs for the past 30 days
    for(let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      initialMedications.forEach(med => {
        med.schedule.times.forEach(time => {
          // Simulate some missed doses for realism
          if(Math.random() > 0.15) { // 85% adherence rate
            const [hours, minutes] = time.split(':');
            date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            logs.push({
              id: `log${med.id}${i}${time}`,
              medicationId: med.id,
              scheduledTime: date.toISOString(),
              actionTime: date.toISOString(),
              status: 'taken'
            });
          } else {
             const [hours, minutes] = time.split(':');
            date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
             logs.push({
              id: `log${med.id}${i}${time}skipped`,
              medicationId: med.id,
              scheduledTime: date.toISOString(),
              actionTime: date.toISOString(),
              status: 'skipped'
            });
          }
        });
      });
    }
    setDoseLogs(logs);
  }, []);

  const addMedication = (med: Omit<Medication, 'id'>) => {
    const newMedication: Medication = { ...med, id: `med${Date.now()}` };
    setMedications(prev => [...prev, newMedication]);
  };

  const logDose = (medicationId: string, status: 'taken' | 'skipped') => {
    const newLog: DoseLog = {
      id: `log${Date.now()}`,
      medicationId,
      scheduledTime: new Date().toISOString(), // Placeholder for simplicity
      actionTime: new Date().toISOString(),
      status,
    };
    setDoseLogs(prev => [newLog, ...prev]);
  };

  const adherenceStats: AdherenceStats = useMemo(() => {
    const relevantLogs = doseLogs.filter(log => parseISO(log.actionTime) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const totalDoses = relevantLogs.length;
    if (totalDoses === 0) return { totalDoses: 0, takenDoses: 0, skippedDoses: 0, adherencePercentage: 100 };
    
    const takenDoses = relevantLogs.filter(log => log.status === 'taken').length;
    const skippedDoses = totalDoses - takenDoses;
    const adherencePercentage = Math.round((takenDoses / totalDoses) * 100);

    return { totalDoses, takenDoses, skippedDoses, adherencePercentage };
  }, [doseLogs]);


  return (
    <div className="flex min-h-screen w-full flex-col bg-background/90">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Dashboard
          </h1>
          <AddMedicationDialog onAddMedication={addMedication} />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div className="lg:col-span-2 xl:col-span-3">
            <MedicationList medications={medications} onLogDose={logDose} />
          </div>
          <div className="flex flex-col gap-6">
            <AdherenceDashboard stats={adherenceStats} logs={doseLogs} />
            <SmartScheduleDialog medications={medications} adherenceData={doseLogs} />
            <ShareDataCard />
          </div>
        </div>
      </main>
    </div>
  );
}
