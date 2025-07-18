import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function safeFetch<T>(
  url: string,
  options?: RequestInit
): Promise<{ data?: T; error?: string }> {
  try {
    const res = await fetch(url, options)
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP error! status: ${res.status}`)
    }
    return { data: await res.json() }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
