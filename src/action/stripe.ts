"use server";

import { stripe } from "@/lib/stripe";
import { onAuthenticateUser } from "./auth";
import Stripe from "stripe";
import { prismaClient } from "@/lib/prismaClient";
import { subscriptionPriceId } from "@/lib/data";
import { AttendedTypeEnum } from "@prisma/client";
import { changeAttendanceType } from "./attendance";

export const getAllProductsFromStripe = async () => {
  try {
    const currentUser = await onAuthenticateUser();

    if (!currentUser.user) {
      return {
        error: "User not authenticated",
        status: 401,
        success: false,
      };
    }

    if (!currentUser.user.stripeConnectId) {
      return {
        error: "User not connected to Stripe",
        status: 401,
        success: false,
      };
    }

    const products = await stripe.products.list(
      {},
      {
        stripeAccount: currentUser.user.stripeConnectId,
      }
    );

    return {
      products: products.data,
      status: 200,
      success: true,
    };
  } catch (error) {
    console.log("Error getting products from Stripe", error);
    return {
      error: "Error getting products from Stripe",
      status: 500,
      success: false,
    };
  }
};

//create checkout link
export const createCheckoutLink = async (priceId: string, stripeId: string, attendeeId:string, webinarId:string, bookCall:boolean=false) => {
  try {
    const session = await stripe.checkout.sessions.create(
      {
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
        metadata:{
          attendeeId:attendeeId,
          webinarId:webinarId,
        }
      },
      {
        stripeAccount: stripeId,
        
      }
    );

    if(bookCall){
      await changeAttendanceType(attendeeId,webinarId, "ADDED_TO_CART");
    }
  

    return {
      sessionUrl: session.url,
      status: 200,
      success: true,
    };
  } catch (error) {
    console.log("Error creating checkout link", error);
    return {
      error: "Error creating checkout link",
      status: 500,
      success: false,
    };
  }
};

export const onGetStripeClientSecret = async (
  email: string,
  userId: string
) => {
  try {
    // 1. Check if the customer already exists
    let customer: Stripe.Customer;
    const existingCustomers = await stripe.customers.list({ email: email });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      // Create a new customer if one doesn't exist
      customer = await stripe.customers.create({
        email: email,
        metadata: {
          userId: userId,
        },
      });
    }

    await prismaClient.user.update({
      where: { id: userId },
      data: {
        stripeCustomerId: customer.id,
      },
    });

    // 2. Create or update the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: subscriptionPriceId }],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
      metadata: {
        userId: userId,
      },
    });

    
    // console.log("Subscription created----->", subscription);
    const paymentIntent = (subscription.latest_invoice as Stripe.Invoice)
    .payment_intent as Stripe.PaymentIntent;
    
    return {
      status: 200,
      secret: paymentIntent.client_secret ,
      customerId: customer.id,
    };
    
  } catch (error) {
    console.error("Subscription creation error:", error);
    return { status: 400, message: "Failed to create subscription" };
  }
};

//update subscription
export const updateSubscription = async (subscription: Stripe.Subscription) => {
  try {
    const userId = subscription.metadata.userId;

    await prismaClient.user.update({
      where: { id: userId },
      data: {
        subscription: subscription.status === "active" ? true: false,
      },
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
  }
};


//update attendee
export const updateAttendee = async (attendeeId: string) => {
  try {
    await prismaClient.attendance.update({
      where: { id: attendeeId },
      data: {
        attendedType: AttendedTypeEnum.CONVERTED,
      },
    });
  } catch (error) {
    console.error("Error updating attendee:", error);
  }
};

