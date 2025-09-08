import { Pill } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2">
        <Pill className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold font-headline text-foreground">
          PillWise
        </span>
      </div>
    </header>
  );
}
