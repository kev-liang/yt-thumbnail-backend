import { Request, Response, type Express } from 'express';
import Stripe from 'stripe';
import config from '../helpers/config';
import { verifyToken } from './middleware/authMiddleware';
import express from 'express';
import { ImageData } from '../types';
import ImageDataRepo from '../repo/ImageDataRepo';

const stripe = new Stripe(config.STRIPE_API_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

const getStripeConfig = (userId: string) => {
  const stripeConfig: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Youtube Thumbnail Swapper Premium',
          },
          unit_amount: 9.99 * 100, // Amount in cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url:
      'https://your-site.com/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://your-site.com/cancel',
    metadata: {
      userId,
    },
  };
  return stripeConfig;
};

const StripeController = (app: Express) => {
  const imageDataRepo = ImageDataRepo();
  interface CheckoutBody {
    imageData: ImageData[];
  }
  const createCheckoutSession = async (
    req: Request<{}, {}, CheckoutBody>,
    res: Response
  ) => {
    if (!req.user) {
      res.status(400).json({ message: 'user is required' });
      return;
    }

    const { userId } = req.user;
    const { imageData } = req.body;
    const stripeConfig = getStripeConfig(userId);
    const session = await stripe.checkout.sessions.create(stripeConfig);
    await imageDataRepo.addAllImageData(userId, imageData);
    res.json({ url: session.url });
  };

  const checkoutSuccess = async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig as string,
        config.WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      res.status(400).send(`Webhook Error: ${err}`);
      return;
    }

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;

        // Payment is successful
        console.log('Payment was successful:', session);

        // Fulfill the purchase
        const customerId = session.customer;
        const sessionId = session.id;
        const paymentStatus = session.payment_status;
        const userId = session.metadata?.userId;

        // Add your custom business logic here
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  };

  app.post(
    '/checkout-success',
    express.raw({ type: 'application/json' }),
    checkoutSuccess
  );
  app.use(express.json());
  app.post('/checkout', verifyToken, createCheckoutSession);
};

export default StripeController;
