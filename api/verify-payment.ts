import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing required payment verification parameters' });
    }

    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!razorpayKeySecret) {
      console.error('Missing Razorpay secret');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Verify HMAC-SHA256 signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(text)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment signature verification failed' });
    }

    // Update in Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase
          .from('merch_orders')
          .update({
            payment_status: 'paid',
            razorpay_payment_id,
            razorpay_signature,
            updated_at: new Date().toISOString()
          })
          .eq('razorpay_order_id', razorpay_order_id);
      } catch (dbErr) {
        console.warn('Supabase update non-blocking error:', dbErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id
    });

  } catch (error: any) {
    console.error('Error in merch verify-payment:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
