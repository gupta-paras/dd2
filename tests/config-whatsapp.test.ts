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
    assert.strictEqual(config.restaurant.whatsapp_number, '+1-555-555-555-5');
    assert.strictEqual(config.restaurant.whatsapp_phone_raw, '15555555555');
    assert.ok(config.ordering_notice.pickup_info.includes('pickup only'));
    assert.strictEqual(config.hero.title, 'A little spice. A lot of comfort.');
    assert.strictEqual(config.hero.title_nl, 'Een beetje pit. Volop genieten.');
    assert.strictEqual(config.about.name, 'Pooja Jain');
  });

  it('generates valid WhatsApp URL containing all order parameters (English)', () => {
    const payload: WhatsAppOrderPayload = {
      orderId: 'DD-9876',
      customerName: 'Sophie van Dijk',
      notes: 'Please keep mild spice, pickup at 18:30',
      items: [
        { name: 'Keema Bitterballen', quantity: 2, price: 8.5 },
        { name: 'Kapsalon Chicken Tikka', quantity: 1, price: 13.5 },
      ],
      total: 30.5,
      language: 'en',
    };

    const url = generateWhatsAppOrderUrl(DEFAULT_CONFIG, payload);

    assert.ok(url.startsWith('https://wa.me/15555555555?text='));

    // Decode URL text
    const urlObj = new URL(url);
    const message = urlObj.searchParams.get('text') || '';

    // Verify key fields in WhatsApp message
    assert.ok(message.includes('Order - Desi Dutch'));
    assert.ok(message.includes('2x Keema Bitterballen - €17.00'));
    assert.ok(message.includes('1x Kapsalon Chicken Tikka - €13.50'));
    assert.ok(message.includes('Total: €30.50'));
    assert.ok(message.includes('Name: Sophie van Dijk'));
    assert.ok(message.includes('Notes: Please keep mild spice, pickup at 18:30'));
  });

  it('generates valid WhatsApp URL containing Dutch translation when language is nl', () => {
    const payload: WhatsAppOrderPayload = {
      customerName: 'Alex Bakker',
      notes: 'Afhalen rond 19:00',
      items: [{ name: 'Masala Stroopwafel', quantity: 3, price: 4.5 }],
      total: 13.5,
      language: 'nl',
    };

    const url = generateWhatsAppOrderUrl(DEFAULT_CONFIG, payload);
    const urlObj = new URL(url);
    const message = urlObj.searchParams.get('text') || '';

    assert.ok(message.includes('Bestelling - Desi Dutch'));
    assert.ok(message.includes('3x Masala Stroopwafel - €13.50'));
    assert.ok(message.includes('Totaal: €13.50'));
    assert.ok(message.includes('Naam: Alex Bakker'));
    assert.ok(message.includes('Opmerkingen: Afhalen rond 19:00'));
  });

  it('GET /api/config returns live configuration via HTTP', async () => {
    const res = await fetch('http://localhost:3000/api/config');
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.restaurant.whatsapp_number, '+1-555-555-555-5');
    assert.ok(json.data.ordering_notice.pickup_info);
  });
});
