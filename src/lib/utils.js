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

export const MOBILE_REGEX = /^[6-9]\d{9}$/

export function sanitizeMobileInput(value) {
  return String(value || '').replace(/\D/g, '').slice(0, 10)
}

export function isValidMobile(mobile) {
  return MOBILE_REGEX.test(sanitizeMobileInput(mobile))
}

export function getNextEmployeeCode(employees = []) {
  let maxNum = 0
  employees.forEach((emp) => {
    const match = emp.employeeCode?.match(/^EMP(\d+)$/i)
    if (match) maxNum = Math.max(maxNum, parseInt(match[1], 10))
  })
  return `EMP${String(maxNum + 1).padStart(3, '0')}`
}

export const PLOT_STATUS = {
  available: { label: 'Available', color: 'bg-green-500', class: 'plot-available' },
  reserved: { label: 'Reserved', color: 'bg-orange-500', class: 'plot-reserved' },
  sold: { label: 'Sold', color: 'bg-red-500', class: 'plot-sold' },
  under_processing: { label: 'Under Processing', color: 'bg-blue-500', class: 'plot-processing' },
}
