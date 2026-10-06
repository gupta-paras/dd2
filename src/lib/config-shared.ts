export interface RestaurantConfig {
  restaurant: {
    name: string;
    cuisine_label: string;
    tagline: string;
    hero_badge: string;
    hero_title_highlight: string;
    hero_title_accent: string;
    hero_subtitle: string;
    phone: string;
    whatsapp_number: string;
    whatsapp_phone_raw: string;
    email: string;
  };
  address: {
    street: string;
    postal_code: string;
    city: string;
    country: string;
    full: string;
    maps_url: string;
  };
  timings: {
    display_hours: string;
    kitchen_closing: string;
    service_note: string;
  };
  delivery: {
    fee: number;
    free_threshold: number;
    currency_symbol: string;
    currency_code: string;
    estimated_time: string;
    pickup_ready_time: string;
  };
  features: Array<{
    id: string;
    title: string;
    desc: string;
  }>;
}

export const DEFAULT_CONFIG: RestaurantConfig = {
  restaurant: {
    name: 'Desi Dutch',
    cuisine_label: 'Pan-Indian Cuisine with a Western Touch',
    tagline: 'Authentic Indian Flavors Across All Regions, Elevated with a Western Touch',
    hero_badge: 'All Regional Indian Cuisines with Modern Western Elegance',
    hero_title_highlight: 'All Indian Cuisines.',
    hero_title_accent: 'Crafted with a Western Touch.',
    hero_subtitle:
      'Experience the vibrant spectrum of Indian culinary traditions—from royal Awadhi kormas, rich Punjabi makhani, and fragrant South Indian spices to zesty street chaats and coastal delicacies—thoughtfully crafted with a refined Western culinary touch.',
    phone: '+1-555-555-555-5',
    whatsapp_number: '+1-555-555-555-5',
    whatsapp_phone_raw: '15555555555',
    email: 'orders@desidutch.com',
  },
  address: {
    street: 'Prinsengracht 412',
    postal_code: '1016 JA',
    city: 'Amsterdam',
    country: 'Netherlands',
    full: 'Prinsengracht 412, 1016 JA Amsterdam',
    maps_url: 'https://maps.google.com/?q=Prinsengracht+412,+1016+JA+Amsterdam',
  },
  timings: {
    display_hours: 'Mon - Sun: 11:30 - 22:30',
    kitchen_closing: 'Last kitchen orders at 22:00',
    service_note: 'Continuous warm service daily',
  },
  delivery: {
    fee: 2.5,
    free_threshold: 25.0,
    currency_symbol: '€',
    currency_code: 'EUR',
    estimated_time: '25 - 35 mins via E-Bike',
    pickup_ready_time: '15 - 20 mins at counter',
  },
  features: [
    {
      id: 'pan_indian',
      title: 'All Indian Cuisines',
      desc: 'North, South, Coastal, Awadhi & Street Food',
    },
    {
      id: 'western_touch',
      title: 'Western Touch',
      desc: 'Artisanal croquettes, ragouts & European pastry craft',
    },
    {
      id: 'dietary',
      title: 'Dietary Friendly',
      desc: '100% Halal meats & fresh vegetarian specialties',
    },
    {
      id: 'fresh',
      title: 'Made To Order',
      desc: 'Fresh stone-ground spices & small-batch gravies',
    },
  ],
};

export interface WhatsAppOrderPayload {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  orderType: 'delivery' | 'pickup';
  notes?: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export function generateWhatsAppOrderUrl(
  config: RestaurantConfig,
  order: WhatsAppOrderPayload
): string {
  const phone =
    config.restaurant.whatsapp_phone_raw ||
    config.restaurant.whatsapp_number.replace(/[^0-9]/g, '');

  const itemsList = order.items
    .map(
      (item) =>
        `• ${item.quantity}x ${item.name} - €${(item.price * item.quantity).toFixed(2)}`
    )
    .join('\n');

  const typeHeader =
    order.orderType === 'delivery' ? '🛵 Delivery Order' : '🛍️ Self Pickup Order';
  const locationLine =
    order.orderType === 'delivery'
      ? `📍 Delivery Address: ${order.customerAddress}`
      : `📍 Pickup Location: ${config.address.full}`;

  const messageLines = [
    `*✨ NEW ORDER - ${config.restaurant.name.toUpperCase()}*`,
    `*Order ID:* ${order.orderId}`,
    `--------------------------------`,
    `*Customer Details:*`,
    `👤 Name: ${order.customerName}`,
    `📞 Phone: ${order.customerPhone}`,
    `📦 Type: ${typeHeader}`,
    locationLine,
    order.notes ? `📝 Kitchen Notes: ${order.notes}` : null,
    `--------------------------------`,
    `*Ordered Items:*`,
    itemsList,
    `--------------------------------`,
    `*Payment Summary:*`,
    `Subtotal: €${order.subtotal.toFixed(2)}`,
    order.orderType === 'delivery'
      ? `Delivery Fee: ${order.deliveryFee === 0 ? 'FREE' : `€${order.deliveryFee.toFixed(2)}`}`
      : null,
    `*Grand Total: €${order.total.toFixed(2)}*`,
    `--------------------------------`,
    `🕒 Ordered at: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    `_Sent via ${config.restaurant.name} Web Ordering_`,
  ].filter(Boolean);

  const fullMessage = messageLines.join('\n');
  return `https://wa.me/${phone}?text=${encodeURIComponent(fullMessage)}`;
}
