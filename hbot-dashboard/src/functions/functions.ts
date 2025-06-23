export function localToUTCISOString(local: string): string {
    const [date, time] = local.split('T');
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
    return utcDate.toISOString();
  }

  // Helpers
export function clamp(val: number, min: number, max: number) {
    return Math.max(min, Math.min(max, val));
  }
  
  export function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }