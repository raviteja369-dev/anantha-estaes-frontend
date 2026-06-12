import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`
  return `₹${amount?.toLocaleString('en-IN') || 0}`
}

export function formatNumber(num) {
  return num?.toLocaleString('en-IN') || '0'
}

export const PLOT_STATUS = {
  available: { label: 'Available', color: 'bg-green-500', class: 'plot-available' },
  reserved: { label: 'Reserved', color: 'bg-orange-500', class: 'plot-reserved' },
  sold: { label: 'Sold', color: 'bg-red-500', class: 'plot-sold' },
  under_processing: { label: 'Under Processing', color: 'bg-blue-500', class: 'plot-processing' },
}
