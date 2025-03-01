import { Request } from 'express';
import Stripe from 'stripe';

declare module 'express' {
  interface Request {
    event?: Stripe.Event;
  }
}

export {};
