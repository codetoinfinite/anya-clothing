export type NavChild = { label: string; href: string };
export type NavGroup = {
  label: string;
  href: string;
  highlight?: boolean;
  columns?: { heading: string; items: NavChild[] }[];
  featured?: { title: string; href: string; image?: string }[];
};

export const primaryNav: NavGroup[] = [
  {
    label: "Kurtas",
    href: "/collections/kurtas",
    columns: [
      {
        heading: "Shop the edit",
        items: [
          { label: "All kurtas", href: "/collections/kurtas" },
          { label: "New arrivals", href: "/collections/new-arrivals" },
          { label: "Best sellers", href: "/collections/best-sellers" },
          { label: "Festive", href: "/collections/festive" },
          { label: "Sale", href: "/collections/sale" },
        ],
      },
    ],
  },
  {
    label: "Dresses",
    href: "/collections/dresses",
    columns: [
      {
        heading: "Shop the edit",
        items: [
          { label: "All dresses", href: "/collections/dresses" },
          { label: "Ethnic sets", href: "/collections/ethnic-sets" },
          { label: "Co-ords", href: "/collections/co-ords" },
        ],
      },
    ],
  },
  { label: "Ethnic Sets", href: "/collections/ethnic-sets" },
  { label: "Co-ords", href: "/collections/co-ords" },
  { label: "Bottom Wear", href: "/collections/bottom-wear" },
  { label: "Jewellery", href: "/collections/jewellery" },
  { label: "Sale", href: "/collections/sale", highlight: true },
];

export const footerLinks = {
  shop: [
    { label: "New arrivals", href: "/collections/new-arrivals" },
    { label: "Best sellers", href: "/collections/best-sellers" },
    { label: "Festive edit", href: "/collections/festive" },
    { label: "Co-ord sets", href: "/collections/co-ords" },
    { label: "Sale", href: "/collections/sale" },
    { label: "Gift cards", href: "/gift-cards" },
  ],
  help: [
    { label: "Track order", href: "/account/orders" },
    { label: "Shipping", href: "/shipping" },
    { label: "Returns & exchange", href: "/returns" },
    { label: "Size guide", href: "/size-guide" },
    { label: "FAQs", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ],
  about: [
    { label: "Our story", href: "/about" },
    { label: "Journal", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
};
