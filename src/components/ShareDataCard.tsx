import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

export default function ShareDataCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <UserPlus className="text-accent" />
            Share with Caregiver
        </CardTitle>
        <CardDescription>Allow a doctor or family member to view your progress.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="secondary" className="w-full" disabled>
            Grant Access (Coming Soon)
        </Button>
      </CardContent>
    </Card>
  );
}
