import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";
import { db } from "@/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    //get access to the body passed in the stripe webhook and signature
    const body = await req.text();
    const signature = headers().get("stripe-signature");

    if (!signature) {
      return new Response("Invalid signature", { status: 400 });
    }

    // ensure that the signature we receive is only from stripe and not users

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === "checkout.session.completed") {
      if (!event.data.object.customer_details?.email) {
        throw new Error("Missing user Email");
      }
      // get the session of the event
      const session = event.data.object as Stripe.Checkout.Session;
      // destructure the metadata that we created when we were creating the payment with stripe in the checkout session
      const { userId, orderId } = session.metadata || {
        userId: null,
        orderId: null,
      };

      if (!userId || orderId) {
        throw new Error("Invalid metadata");
      }
      // get the billing and shipping adress of the user
      const billingAdress = session.customer_details!.address;
      const shippingAdress = session.shipping_details!.address;

      // update the order table that the user has paid
      await db.order.update({
        where: {
          id: orderId!,
        },
        data: {
          isPaid: true,
          shippingAdress: {
            create: {
              name: session.customer_details!.name!,
              city: shippingAdress!.city!,
              country: shippingAdress!.country!,
              postalCode: shippingAdress!.postal_code!,
              street: shippingAdress!.line1!,
              state: shippingAdress!.state,
            },
          },

          billingAdress: {
            create: {
              name: session.customer_details!.name!,
              city: billingAdress!.city!,
              country: billingAdress!.country!,
              postalCode: billingAdress!.postal_code!,
              street: billingAdress!.line1!,
              state: billingAdress!.state,
            },
          },
        },
      });
    }

    return NextResponse.json({ result: event, ok: true });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { message: "Something went wrong", ok: false },
      { status: 500 }
    );
  }
}
