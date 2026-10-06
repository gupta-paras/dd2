export interface RestaurantConfig {
  restaurant: {
    name: string;
    cuisine_label: string;
    cuisine_label_nl: string;
    tagline: string;
    tagline_nl: string;
    whatsapp_number: string;
    whatsapp_phone_raw: string;
  };
  ordering_notice: {
    pickup_info: string;
    pickup_info_nl: string;
  };
  hero: {
    eyebrow: string;
    eyebrow_nl: string;
    title: string;
    title_nl: string;
    subtitle: string;
    subtitle_nl: string;
    cta_button: string;
    cta_button_nl: string;
    tagline_footer: string;
    tagline_footer_nl: string;
    card_title: string;
    card_title_nl: string;
    card_subtitle: string;
    card_subtitle_nl: string;
    card_image: string;
  };
  menu_section: {
    eyebrow: string;
    eyebrow_nl: string;
    title: string;
    title_nl: string;
    subtitle: string;
    subtitle_nl: string;
  };
  about: {
    eyebrow: string;
    eyebrow_nl: string;
    title: string;
    title_nl: string;
    name: string;
    bio: string;
    bio_nl: string;
    photo_url: string;
  };
  how_to_order: {
    eyebrow: string;
    eyebrow_nl: string;
    title: string;
    title_nl: string;
    steps: Array<{
      step: string;
      title: string;
      title_nl: string;
      desc: string;
      desc_nl: string;
    }>;
  };
  occasions: {
    party_orders_title: string;
    party_orders_title_nl: string;
    party_orders_desc: string;
    party_orders_desc_nl: string;
    customization_title: string;
    customization_title_nl: string;
    customization_desc: string;
    customization_desc_nl: string;
  };
}

export const DEFAULT_CONFIG: RestaurantConfig = {
  restaurant: {
    name: 'Desi Dutch',
    cuisine_label: 'Indian Kitchen',
    cuisine_label_nl: 'Indische Keuken',
    tagline: 'Indian flavours. Dutch gezelligheid.',
    tagline_nl: 'Indiase smaken. Hollandse gezelligheid.',
    whatsapp_number: '+1-555-555-555-5',
    whatsapp_phone_raw: '15555555555',
  },
  ordering_notice: {
    pickup_info:
      'Orders are available for pickup only, at least 3 hours after placing your order. We’ll confirm your pickup time and location via WhatsApp.',
    pickup_info_nl:
      'Bestellingen kunnen alleen worden afgehaald, minimaal 3 uur na het plaatsen van je bestelling. We bevestigen je afhaaltijd en locatie via WhatsApp.',
  },
  hero: {
    eyebrow: 'DESI DUTCH · INDIAN KITCHEN',
    eyebrow_nl: 'DESI DUTCH · INDISCHE KEUKEN',
    title: 'A little spice. A lot of comfort.',
    title_nl: 'Een beetje pit. Volop genieten.',
    subtitle:
      'Your favourite Indian flavours, from creamy curries to fragrant biryani. Choose your dishes and order directly on WhatsApp.',
    subtitle_nl:
      'Je favoriete Indiase smaken, van romige curry’s tot geurige biryani. Kies je gerechten en bestel direct via WhatsApp.',
    cta_button: 'Explore the menu',
    cta_button_nl: 'Bekijk het menu',
    tagline_footer: 'Indian flavours. Dutch gezelligheid.',
    tagline_footer_nl: 'Indiase smaken. Hollandse gezelligheid.',
    card_title: 'THE DESI DUTCH KITCHEN',
    card_title_nl: 'DE DESI DUTCH KEUKEN',
    card_subtitle: 'Comfort, with a kick.',
    card_subtitle_nl: 'Comfort met karakter.',
    card_image: 'https://desi-dutch-kitchen.sj-ams.chatgpt.site/images/butter-chicken.jpg',
  },
  menu_section: {
    eyebrow: 'FIND YOUR FAVOURITE',
    eyebrow_nl: 'KIES JE FAVORIET',
    title: 'The menu',
    title_nl: 'Ons menu',
    subtitle: 'Choose something delicious.',
    subtitle_nl: 'Kies iets lekkers.',
  },
  about: {
    eyebrow: 'THE PERSON BEHIND DESI DUTCH',
    eyebrow_nl: 'DE PERSOON ACHTER DESI DUTCH',
    title: 'A love of cooking. A joy in sharing.',
    title_nl: 'Liefde voor koken. Plezier in delen.',
    name: 'Pooja Jain',
    bio: 'Hi, I’m Pooja. I started Desi Dutch because I love cooking, and sharing the food I make is what I enjoy most. For me, a good meal is a lovely way to bring people together. Through Desi Dutch, I want to share the Indian flavours I love with you. I hope you enjoy eating these dishes as much as I enjoy preparing them.',
    bio_nl:
      'Hoi, ik ben Pooja. Ik ben Desi Dutch begonnen vanuit mijn liefde voor koken. Het liefst deel ik het eten dat ik maak met anderen. Voor mij is een lekkere maaltijd een mooie manier om mensen samen te brengen. Met Desi Dutch wil ik de Indiase smaken waar ik van houd met je delen. Ik hoop dat je net zoveel geniet van deze gerechten als ik van het bereiden ervan.',
    photo_url: 'https://desi-dutch-kitchen.sj-ams.chatgpt.site/api/images/a6ad8a5c-1a63-475a-ac66-f8d4b1dff4bc.jpg',
  },
  how_to_order: {
    eyebrow: 'STRAIGHT TO OUR KITCHEN',
    eyebrow_nl: 'DIRECT NAAR ONZE KEUKEN',
    title: 'Good food. Easy ordering.',
    title_nl: 'Lekker eten. Eenvoudig bestellen.',
    steps: [
      {
        step: '01',
        title: 'Pick your dishes',
        title_nl: 'Kies je gerechten',
        desc: 'Add your favourites to your basket.',
        desc_nl: 'Voeg je favorieten toe aan je winkelmandje.',
      },
      {
        step: '02',
        title: 'Send on WhatsApp',
        title_nl: 'Verstuur via WhatsApp',
        desc: 'Your basket becomes a ready-written message. Press Send in WhatsApp.',
        desc_nl: 'Je bestelling wordt een vooraf ingevuld bericht. Druk op Verzenden in WhatsApp.',
      },
      {
        step: '03',
        title: 'We confirm your order',
        title_nl: 'Wij bevestigen je bestelling',
        desc: 'We confirm availability, payment and pickup in the chat.',
        desc_nl: 'We bevestigen de beschikbaarheid, betaling en afhaaltijd in het gesprek.',
      },
    ],
  },
  occasions: {
    party_orders_title: 'Birthday & party orders',
    party_orders_title_nl: 'Bestellingen voor verjaardagen en feesten',
    party_orders_desc:
      'Celebrating something special? We accept birthday and party orders by pre-order only. Contact us on WhatsApp to discuss your menu and arrangements in advance.',
    party_orders_desc_nl:
      'Iets bijzonders te vieren? We nemen bestellingen voor verjaardagen en feesten uitsluitend op voorbestelling aan. Bespreek je menu en wensen vooraf met ons via WhatsApp.',
    customization_title: 'Made to your liking',
    customization_title_nl: 'Naar jouw smaak',
    customization_desc:
      'Food can be customised to your preferences. Tell us what you like when ordering on WhatsApp, and we’ll confirm what we can prepare for you.',
    customization_desc_nl:
      'Gerechten kunnen worden aangepast aan jouw voorkeuren. Geef je wensen door bij het bestellen via WhatsApp, dan bevestigen we wat we voor je kunnen bereiden.',
  },
};

export interface WhatsAppOrderPayload {
  orderId?: string;
  customerName?: string;
  notes?: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  language?: 'en' | 'nl';
}

export function generateWhatsAppOrderUrl(
  config: RestaurantConfig,
  order: WhatsAppOrderPayload
): string {
  const phone =
    config.restaurant.whatsapp_phone_raw ||
    config.restaurant.whatsapp_number.replace(/[^0-9]/g, '');

  const isNl = order.language === 'nl';

  const itemsList = order.items
    .map(
      (item) =>
        `• ${item.quantity}x ${item.name} - €${(item.price * item.quantity).toFixed(2)}`
    )
    .join('\n');

  const titleHeader = isNl
    ? `*Bestelling - ${config.restaurant.name}*`
    : `*Order - ${config.restaurant.name}*`;

  const customerLabel = isNl ? 'Naam' : 'Name';
  const notesLabel = isNl ? 'Opmerkingen' : 'Notes';
  const totalLabel = isNl ? 'Totaal' : 'Total';

  const messageLines = [
    titleHeader,
    itemsList,
    `*${totalLabel}: €${order.total.toFixed(2)}*`,
    order.customerName ? `${customerLabel}: ${order.customerName}` : null,
    order.notes ? `${notesLabel}: ${order.notes}` : null,
  ].filter(Boolean);

  const fullMessage = messageLines.join('\n\n');
  return `https://wa.me/${phone}?text=${encodeURIComponent(fullMessage)}`;
}
