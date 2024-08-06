import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Metadata } from "next"

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

export function constructMetadata({
  title = 'Casestore - custom high-quality phone cases',
  description = 'Create custom high-quality phone cases in seconds',
  image = '/thumbnail.png',
  icons = '/favicon.ico',
}: {
  title?: string
  description?: string
  image?: string
  icons?: string
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@Grace',
    },
    icons,
    metadataBase: new URL("https://case-store-beta.vercel.app/")
  }
}