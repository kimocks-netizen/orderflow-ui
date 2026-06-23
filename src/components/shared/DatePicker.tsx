import { useRef } from "react";
import { Calendar } from "lucide-react";

interface DatePickerProps {
  value: string;
  onChange: (v: string) => void;
  min?: string;
  placeholder: string;
}

export function DatePicker({ value, onChange, min, placeholder }: DatePickerProps) {
  const ref = useRef<HTMLInputElement>(null);
  const display = value ? value.replace(/-/g, "/") : placeholder;
  return (
    <div
      className="relative flex items-center h-9 rounded-md border border-input bg-background text-sm w-36 cursor-pointer"
      onClick={() => ref.current?.click()}
    >
      <Calendar className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none z-10 shrink-0" />
      <span className={`absolute left-8 right-1 pointer-events-none z-10 text-sm truncate ${value ? "text-foreground" : "text-muted-foreground"}`}>
        {display}
      </span>
      <input
        ref={ref}
        type="date"
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
      />
    </div>
  );
}
