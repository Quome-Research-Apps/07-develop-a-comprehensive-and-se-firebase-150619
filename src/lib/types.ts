export type Medication = {
  id: string;
  name: string;
  dosage: string;
  form: 'pill' | 'liquid' | 'injection' | 'other';
  schedule: {
    type: 'daily' | 'weekly' | 'interval';
    times: string[]; // e.g., ["08:00", "20:00"]
    days?: number[]; // For weekly, 0=Sun, 1=Mon...
    intervalDays?: number; // For interval, e.g., every 2 days
  };
  instructions?: string;
};

export type DoseLog = {
  id: string;
  medicationId: string;
  scheduledTime: string; // ISO string
  actionTime: string; // ISO string
  status: 'taken' | 'skipped';
};

export type AdherenceStats = {
  totalDoses: number;
  takenDoses: number;
  skippedDoses: number;
  adherencePercentage: number;
};
