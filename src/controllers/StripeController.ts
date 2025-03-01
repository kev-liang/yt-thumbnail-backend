import { Request, Response, type Express } from 'express';
import Stripe from 'stripe';
import config from '../helpers/config';
import { verifyToken } from './middleware/authMiddleware';
import express from 'express';
import { ImageData } from '../types';
import { upgradeUser } from '../services/UserService';
import logger from '../helpers/logger';
import { verifyStripe } from './middleware/stripeMiddleware';
// import { getIO } from '../socket/socket';
import consts from '../helpers/consts';
import { getWebSocketServer } from '../socket/socket';

export const stripe = new Stripe(config.STRIPE_API_KEY || '', {
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
    const stripeConfig = getStripeConfig(userId);
    const session = await stripe.checkout.sessions.create(stripeConfig);
    res.json({ url: session.url });
  };

  const checkoutSuccess = async (req: Request, res: Response) => {
    let { event } = res.locals;
    if (!event) return;
    logger.info('Checkout success');
    const socket = getWebSocketServer();
    socket.emit(consts.SOCKET_PAID);
    console.log('STRIPPPING');
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (!userId) {
          res
            .status(500)
            .json({ error: 'No userId found in session metadata' });
          return;
        }

        upgradeUser(userId);
        // TODO set up webhook
        break;

      default:
        res.status(400).json({ error: `Unhandled event type: ${event.type}` });
    }
  };

  app.post(
    '/checkout-success',
    express.raw({ type: 'application/json' }),
    verifyStripe,
    checkoutSuccess
  );
  app.use(express.json());
  app.get('/checkout', verifyToken, createCheckoutSession);
};

export default StripeController;
