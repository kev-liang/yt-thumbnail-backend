import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { stripe } from '../StripeController';
import logger from '../../helpers/logger';
import config from '../../helpers/config';

export const verifyStripe = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const sig = req.headers['stripe-signature'];
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      config.WEBHOOK_SECRET
    );
    res.locals.event = event;
    next();
  } catch (err) {
    logger.error('Webhook signature verification failed:', err);
    res.status(400).send(`Webhook Error: ${err}`);
    return;
  }
};
