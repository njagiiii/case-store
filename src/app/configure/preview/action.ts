'use server'

import { BASE_PRICE, PRODUCT_PRICES } from "@/constants/products"
import { db } from "@/db"
import { stripe } from "@/lib/stripe"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { Order } from "@prisma/client"
// create a stripe action

export const createCheckoutSession = async({configId} : {configId: string}) => {
    const configuration = await db.configuration.findUnique({
        where:{id: configId},
    })
    if(!configuration){
        throw new Error("No Such Configuration Found!")
    }

    const {getUser} = getKindeServerSession()
    const user = await getUser()

    if(!user){
        throw new Error("You need to be logged in")
    }

    if (!user?.id || !user.email) {
        throw new Error('Invalid user data')
      }
    
      const existingUser = await db.user.findFirst({
        where: { id: user.id },
      })
    
      if (!existingUser) {
        await db.user.create({
          data: {
            id: user.id,
            email: user.email,
          },
        })
      }
    

     

    const {finish, material} = configuration;

    // payment session based on the finish and material
    let price = BASE_PRICE
    if(finish === 'textured') price += PRODUCT_PRICES.finish.textured
    if(material === 'polycarbonate') price += PRODUCT_PRICES.material.polycarbonate

    // create actual order
    // check first if there is an existing order 
    let order: Order | undefined = undefined

    const existingOrder = await db.order.findFirst({
        where: {
            userId : user.id,
            configurationId: configuration.id
        }
    })

    console.log(user.id, configuration.id)

    if(existingOrder){
        order = existingOrder
    }else{
        order = await db.order.create({
            data:{
                amount: price / 100,
                userId : user.id,
                configurationId : configuration.id
            }
        })
    }

   

    // to create the payment section we should first know which product the user is buying
    const product = await stripe.products.create({
        name:"Custom Iphone Case",
        images:[configuration.imageUrl],
        default_price_data: {
            currency: "KES",
            unit_amount: price,
        }
    })

    // payment section

    const stripeSession = await stripe.checkout.sessions.create({
        success_url :`${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderId=${order.id}`,
        cancel_url : `${process.env.NEXT_PUBLIC_SERVER_URL}/configure/preview?id=${configuration.id}`,
        payment_method_types: ['card'],
        mode:"payment",
        shipping_address_collection: {allowed_countries: ["KE"]},
        metadata:{
            userId: user.id,
            orderId: order.id,
        },
        line_items: [{price: product.default_price as string, quantity:1}]
    })

    // url is the hosted page by stripe(push user to the url)
    return{ url: stripeSession.url }

}