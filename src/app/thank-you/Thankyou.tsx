"use client"

import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { getPaymentStatus } from './actions'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

const Thankyou = () => {

    const searchParams = useSearchParams()
    const orderId = searchParams.get("orderId") || ''
  
    const { data } = useQuery({
        queryKey: ["get-payment-status"],
        queryFn: async() => await getPaymentStatus({orderId}),
        retry: true,
        retryDelay: 500,
    })

    // loading state as their order processes
    if(data === undefined){
        return <div className="w-full mt-24 flex justify-center">
            <div className="flex flex-col items-end gap-2">
                <Loader2 className='h-8 w-8 animate-spin text-zinc-500'>
                    <h3 className="font-semibold text-xl">Loading your order..</h3>
                    <p> This won't take long.</p>
                </Loader2>
            </div>
        </div>
    }

    //  not yet paid state
    if(data === false) {
        return <div className="w-full mt-24 flex justify-center">
            <div className="flex flex-col items-end gap-2">
                <Loader2 className='h-8 w-8 animate-spin text-zinc-500'>
                    <h3 className="font-semibold text-xl">Verifying your payment...</h3>
                    <p> This may take a moment.</p>
                </Loader2>
            </div>
        </div>
    }

    // paid state destructure the data we get
     const {configuration, billingAddress, shippingAddress, amount} = data
     const { color} = configuration


  
    return <div className='bg-white'>
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <div className="max-w-xl">
                <p className="text-base font-medium text-primary">Thankyou!</p>
                <h1 className="mt-2 text-4xl font-bold tracking-tight">Your case is on the way!</h1>
                <p className="mt-2 text-base text-zinc-500">We've received your order and are now processing it</p>

                <div className="mt012 text-sm font-medium">
                    <p className="text-zinc-900">Order number</p>
                    <p className="mt-2 text-zinc-500">{orderId}</p>
                </div>
            </div>
        </div>
    </div>
}

export default Thankyou