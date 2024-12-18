// payment.controller.ts
import { Controller, Post, Body, UseGuards, Req, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetTransactionsDto } from './dto/transactions.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Post('buy')
  async purchaseItems(
    @Req() req,
    @Body('modelIds') modelIds: number[],
    @Body('paymentMethodId') paymentMethodId: string,
    @Res() res: Response
  ) {
    const userId = req.user.userId;
    // const userId =7
    
    // Calculate the total amount based on the modelIds (you'll need to fetch this from your service or database)
    const totalAmount = await this.paymentService.purchaseItems(userId, modelIds, paymentMethodId);

    try {
      // Create Stripe checkout session
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Product Name', // Replace with dynamic product name if needed
              },
              unit_amount: totalAmount, // Amount in cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: 'http://localhost:4200/ordersuccessful', // Replace with your success URL
        cancel_url: 'http://localhost:4200/orderfail', // Replace with your cancel URL
      });

      // console.log('Checkout session created:', session.id);

      // Respond with the session ID to the frontend
      return res.status(200).json({ session: session});
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return res.status(500).json({ error: 'Unable to create checkout session' });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('purchases')
  getPurchasedItems(@Req() req) {
    const userId = req.user.userId;
    return this.paymentService.getPurchasedItems(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('review')
  addReview(
    @Req() req,
    @Body('modelId') modelId: number,
    @Body('reviewMessage') reviewMessage: string,
    @Body('reviewStars') reviewStars: number,
  ) {
    const userId = req.user.userId;
    return this.paymentService.addReview(userId, modelId, reviewMessage, reviewStars);
  }

  @Get('transactions')
  async getTransactions(@Query() filters: GetTransactionsDto) {
    return this.paymentService.getTransactions(filters);
  }

  private stripe = require('stripe')('sk_test_51Q24UAP2pLFNRjVaQWTTeUUdoQNXEzPSQZVx64h5Z3X8LYa9MKFBghXMYvUhC0Bn7g8ejbMAkgSu6rFCNjQmeqGw00y4UdGAd7');

  @Post('create-checkout-session')
  async createCheckoutSession(@Res() res: Response) {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Product Name',
              },
              unit_amount: 2000, // Amount in cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: 'http://localhost:4200/ordersuccessful',
        cancel_url: 'http://localhost/cancel',
      });

      console.log('session', session.id);

      // Respond with the session ID
      return res.status(200).json({ id: session });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return res.status(500).json({ error: 'Unable to create checkout session' });
    }
  }

}
