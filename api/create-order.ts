import type { VercelRequest, VercelResponse } from '@vercel/node';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

const PRODUCT_PRICES: Record<string, number> = {
  nit: 499,        // ₹499
  research: 699,   // ₹699
};

const REFERRAL_DISCOUNT = 0.10; // 10% off with valid code

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { items, customer, referralCode } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    if (!customer || !customer.name || !customer.email || !customer.phone || !customer.address || !customer.pincode) {
      return res.status(400).json({ error: 'Please provide all delivery details' });
    }

    // Calculate total price server-side to prevent tampering
    let totalInRupees = 0;
    const itemSummaries: string[] = [];

    for (const item of items) {
      const unitPrice = PRODUCT_PRICES[item.type] || 699;
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      totalInRupees += unitPrice * qty;

      let desc = `${item.title} (Size: ${item.size || 'M'}`;
      if (item.details?.nitName) desc += `, ${item.details.nitName}`;
      if (item.details?.userName) desc += `, Name: ${item.details.userName}`;
      if (item.details?.batch) desc += `, Batch: ${item.details.batch}`;
      desc += `) x${qty}`;
      itemSummaries.push(desc);
    }

    // Validate referral code server-side (non-blocking)
    let discountApplied = false;
    if (referralCode && typeof referralCode === 'string') {
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (supabaseUrl && supabaseKey) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          const code = referralCode.trim().toUpperCase();
          const { data: codeRow } = await supabase
            .from('referral_codes')
            .select('*, referrers!inner(status)')
            .eq('code', code)
            .single();
          const referrer = codeRow?.referrers as { status: string } | undefined;
          const now = new Date();
          const isActive =
            codeRow &&
            codeRow.status === 'active' &&
            referrer?.status === 'approved' &&
            (!codeRow.valid_until || new Date(codeRow.valid_until) > now) &&
            (codeRow.max_uses == null || codeRow.uses_count < codeRow.max_uses);
          if (isActive) discountApplied = true;
        } catch (refErr) {
          console.warn('Referral validation non-blocking error:', refErr);
        }
      }
    }

    if (discountApplied) {
      totalInRupees = Math.round(totalInRupees * (1 - REFERRAL_DISCOUNT));
    }

    const amountInPaise = totalInRupees * 100;

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Missing Razorpay credentials');
      return res.status(500).json({ error: 'Payment gateway configuration error' });
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    const receipt = `mrch_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      notes: {
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        shippingAddress: `${customer.address}, ${customer.city || ''}, ${customer.state || ''} - ${customer.pincode}`,
        summary: itemSummaries.slice(0, 3).join('; '),
        ...(discountApplied ? { referralCode: referralCode.trim().toUpperCase(), discount: '10%' } : {})
      }
    });

    // Attempt to persist in Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Try recording to merch_orders if exists
        await supabase.from('merch_orders').insert([{
          order_id: receipt,
          razorpay_order_id: order.id,
          customer_name: customer.name,
          customer_email: customer.email,
          customer_phone: customer.phone,
          shipping_address: customer.address,
          city: customer.city || '',
          state: customer.state || '',
          pincode: customer.pincode,
          items,
          amount_minor: amountInPaise,
          currency: 'INR',
          payment_status: 'order_created',
          order_status: 'processing',
          ...(discountApplied ? { referral_code: referralCode.trim().toUpperCase() } : {})
        }]);

        // Also track lead
        await supabase.from('leads').insert([{
          name: customer.name,
          email: customer.email,
          resource: 'merch-checkout'
        }]);
      } catch (dbErr) {
        console.warn('Supabase logging non-blocking error:', dbErr);
      }
    }

    return res.status(200).json({
      orderId: order.id,
      receipt,
      amount: amountInPaise,
      currency: 'INR',
      keyId: razorpayKeyId,
      discountApplied
    });

  } catch (error: any) {
    console.error('Error in merch create-order:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
