export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  cover: string;
  tag: string;
  body: string[];
};

export const POSTS: BlogPost[] = [
  {
    slug: "festive-edit-2026",
    title: "The Festive Edit 2026: How to style heirloom kurtas",
    excerpt: "From morning pujas to late-night sangeets — five effortless silhouettes for the season.",
    date: "2026-05-12",
    author: "Aanya Studio",
    tag: "Style",
    cover: "https://images.pexels.com/photos/8819319/pexels-photo-8819319.jpeg?auto=compress&cs=tinysrgb&w=1600",
    body: [
      "Festive dressing in 2026 is about quiet confidence — less ornament, more presence. Our atelier returned to four foundational silhouettes this season: the long anarkali, the straight kurta, the bandhgala set, and the wrap-front sharara.",
      "Pair an ivory chikankari kurta with handwoven silk palazzos for an early-morning puja, then swap into a sequin dupatta at dusk. Same kurta, two moods.",
      "Jewellery rule of thumb: one statement piece, never two. Let either the earrings or the maang tikka speak — never both at once.",
    ],
  },
  {
    slug: "block-print-care",
    title: "Caring for block-print: a 5-step ritual",
    excerpt: "Hand-blocked cottons demand a gentle hand. Here is the wash routine that keeps colours singing.",
    date: "2026-04-28",
    author: "Aanya Atelier",
    tag: "Care",
    cover: "https://images.pexels.com/photos/9339397/pexels-photo-9339397.jpeg?auto=compress&cs=tinysrgb&w=1600",
    body: [
      "First wash: cold water, half a cap of mild liquid detergent, no soaking past 10 minutes. Vegetable dyes bleed in the first two washes — this is expected, not a defect.",
      "Always line-dry in shade. Direct sun bleaches indigos and madders quickest.",
      "Iron on the reverse side at a medium setting, ideally with a thin cotton cloth between iron and fabric.",
    ],
  },
  {
    slug: "artisan-spotlight-bagru",
    title: "Artisan spotlight: the Bagru block-printers of Rajasthan",
    excerpt: "We spent four days with the families who hand-print our spring collection. Here's what we learned.",
    date: "2026-04-10",
    author: "Meher Kapoor",
    tag: "Atelier",
    cover: "https://images.pexels.com/photos/28389703/pexels-photo-28389703.jpeg?auto=compress&cs=tinysrgb&w=1600",
    body: [
      "Bagru is a small town, 30 kilometres west of Jaipur, where block-printing has been practiced by the Chhipa community for over 300 years. The process is unhurried — and intentionally so.",
      "Each metre of fabric passes through eight hands before it reaches our cutting tables. The dyer, the printer, the washer, the sun-dryer — every craft is its own apprenticeship.",
      "Supporting these families means honouring their pace. Our spring drop ships in small batches because the craft cannot be rushed.",
    ],
  },
];

export function getPost(slug: string) {
  return POSTS.find((p) => p.slug === slug);
}
