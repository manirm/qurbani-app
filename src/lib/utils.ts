import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function naturalSort<T>(items: T[], keyGetter: (item: T) => string): T[] {
  return [...items].sort((a, b) => {
    const aVal = keyGetter(a);
    const bVal = keyGetter(b);
    return aVal.localeCompare(bVal, undefined, { numeric: true, sensitivity: 'base' });
  });
}
