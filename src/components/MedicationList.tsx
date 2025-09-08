import type { Medication } from '@/lib/types';
import MedicationItem from '@/components/MedicationItem';
import { Card } from './ui/card';

interface MedicationListProps {
  medications: Medication[];
  onLogDose: (medicationId: string, status: 'taken' | 'skipped') => void;
}

export default function MedicationList({ medications, onLogDose }: MedicationListProps) {
  return (
    <div className="space-y-4">
      <h2 className="font-headline text-2xl font-semibold">Your Medications</h2>
      {medications.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3">
          {medications.map(med => (
            <MedicationItem key={med.id} medication={med} onLogDose={onLogDose} />
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/50 p-12 text-center">
            <h3 className="text-lg font-medium">No medications yet</h3>
            <p className="text-sm text-muted-foreground">Add your first medication to get started.</p>
        </Card>
      )}
    </div>
  );
}
