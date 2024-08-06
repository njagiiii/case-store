"use server"

import { db } from "@/db"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"

// check the statuses of the payment

export const getPaymentStatus = async ({orderId}: {orderId: string}) => {
    const {getUser} = getKindeServerSession()
    const user = await getUser()

    if(!user?.id || !user.email){
        throw new Error("You need to be logged in to view this page")
    }

    // get orders

    const order = await db.order.findFirst({
        where: {id: orderId, userId: user.id},
        include: {
            billingAddress: true,
            configuration: true,
            shippingAddress: true,
            user: true
        }
    })

    if(!order) throw new Error("Order doesn't exist")

    if(order.isPaid){
        return order
    }else{
        return false
    }

}