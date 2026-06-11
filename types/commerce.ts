export type Category =
  | "Electronics"
  | "Beauty"
  | "Home"
  | "Fashion"
  | "Kids"
  | "Travel"
  | "Auto"
  | "Sports"
  | "Pets"
  | "Office"
  | "Health"
  | "Groceries";

export type Marketplace =
  | "Amazon"
  | "AliExpress"
  | "Alibaba"
  | "Trendyol"
  | "Temu"
  | "eBay"
  | "Shein"
  | "Ozon";

export type PaymentMethod = "Kaspi" | "Card" | "Wallet" | "Installments";

export type Product = {
  id: string;
  name: string;
  category: Category;
  subcategory: string;
  marketplace: Marketplace;
  originCountry: string;
  imageUrl: string;
  description: string;
  tags: string[];
  specs: Record<string, string>;
  variants: MarketplaceVariant[];
  retailPriceKzt: number;
  groupPriceKzt: number;
  minParticipants: number;
  currentParticipants: number;
  deliveryEstimate: string;
  rating: number;
  paymentMethods: PaymentMethod[];
  localizedNote: string;
};

export type MarketplaceVariant = {
  id: string;
  marketplace: Marketplace;
  title: string;
  seller: string;
  imageUrl: string;
  priceKzt: number;
  wholesalePriceKzt: number;
  minWholesaleQty: number;
  deliveryEstimate: string;
  rating: number;
  reviews: number;
  originCountry: string;
  sourceUrl: string;
};

export type Interest = {
  label: Category;
  description: string;
};

export type JourneyStep = {
  title: string;
  description: string;
};
