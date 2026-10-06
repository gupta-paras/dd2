import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_CONFIG,
  generateWhatsAppOrderUrl,
  WhatsAppOrderPayload,
} from '../src/lib/config-shared';
import { getRestaurantConfig } from '../src/lib/config';

describe('Config & WhatsApp Order Flow Verification', () => {
  it('reads restaurant configuration from config.yaml with fallback safety', () => {
    const config = getRestaurantConfig();
    assert.ok(config);
    assert.strictEqual(config.restaurant.name, 'Desi Dutch');
    assert.strictEqual(config.restaurant.phone, '+1-555-555-555-5');
    assert.strictEqual(config.restaurant.whatsapp_number, '+1-555-555-555-5');
    assert.strictEqual(config.restaurant.whatsapp_phone_raw, '15555555555');
    assert.ok(config.address.full.includes('Prinsengracht 412'));
    assert.ok(config.timings.display_hours.includes('11:30 - 22:30'));
    assert.strictEqual(config.delivery.free_threshold, 25.0);
    assert.strictEqual(config.delivery.fee, 2.5);
  });

  it('generates valid WhatsApp URL containing all order parameters', () => {
    const payload: WhatsAppOrderPayload = {
      orderId: 'DD-9876',
      customerName: 'Pooja Gupta',
      customerPhone: '+31 6 9876 5432',
      customerAddress: 'Keizersgracht 400, 1016 EK Amsterdam',
      orderType: 'delivery',
      notes: 'Extra spicy sambal please',
      items: [
        { name: 'Keema Bitterballen with Mint Mayo', quantity: 2, price: 8.5 },
        { name: 'Kapsalon Chicken Tikka', quantity: 1, price: 13.5 },
      ],
      subtotal: 30.5,
      deliveryFee: 0,
      total: 30.5,
    };

    const url = generateWhatsAppOrderUrl(DEFAULT_CONFIG, payload);

    assert.ok(url.startsWith('https://wa.me/15555555555?text='));

    // Decode URL text
    const urlObj = new URL(url);
    const message = urlObj.searchParams.get('text') || '';

    // Verify key fields in WhatsApp message
    assert.ok(message.includes('DD-9876'), 'Order ID must be in message');
    assert.ok(message.includes('Pooja Gupta'), 'Customer name must be in message');
    assert.ok(message.includes('Delivery Order'), 'Order type must be in message');
    assert.ok(message.includes('Keizersgracht 400'), 'Address must be in message');
    assert.ok(message.includes('2x Keema Bitterballen with Mint Mayo - €17.00'));
    assert.ok(message.includes('1x Kapsalon Chicken Tikka - €13.50'));
    assert.ok(message.includes('Grand Total: €30.50'));
    assert.ok(message.includes('Extra spicy sambal please'));
  });

  it('generates valid WhatsApp URL for self-pickup orders', () => {
    const payload: WhatsAppOrderPayload = {
      orderId: 'DD-1234',
      customerName: 'Alex Bakker',
      customerPhone: '+31 6 1122 3344',
      orderType: 'pickup',
      items: [{ name: 'Masala Stroopwafel', quantity: 3, price: 4.5 }],
      subtotal: 13.5,
      deliveryFee: 0,
      total: 13.5,
    };

    const url = generateWhatsAppOrderUrl(DEFAULT_CONFIG, payload);
    const urlObj = new URL(url);
    const message = urlObj.searchParams.get('text') || '';

    assert.ok(message.includes('Self Pickup Order'));
    assert.ok(message.includes('Prinsengracht 412'));
    assert.ok(message.includes('Grand Total: €13.50'));
  });

  it('GET /api/config returns live configuration via HTTP', async () => {
    const res = await fetch('http://localhost:3000/api/config');
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.restaurant.phone, '+1-555-555-555-5');
    assert.strictEqual(json.data.restaurant.whatsapp_number, '+1-555-555-555-5');
  });
});
