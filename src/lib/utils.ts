import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// fotamtting prices

export const formatPrice = (price : number) => {
  const formatter = new Intl.NumberFormat("en-us", {
    style: "currency",
    currency: 'KES',
  })
  return formatter.format(price)
}