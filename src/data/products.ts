import IMG1 from "../assets/IMG1.jpg";
import IMG2 from "../assets/IMG2.jpg";
import IMG3 from "../assets/IMG3.jpg";
import IMG4 from "../assets/IMG4.jpg";
import IMG5 from "../assets/IMG5.jpg";
import IMG6 from "../assets/IMG6.jpg";
import IMG7 from "../assets/IMG7.jpg";
import IMG8 from "../assets/IMG8.jpg";

export interface ProductImage {
  url: string;
  isPrimary: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image?: string; // legacy support
  images?: ProductImage[];
  description?: string;
  createdAt?: unknown;
}

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Premium Leather Wallet",
    category: "Belts",
    price: 1299,
    image: IMG1,
  },
  {
    id: "2",
    name: "Handcrafted Leather Belt",
    category: "Wallets",
    price: 1799,
    image: IMG2,
  },
  {
    id: "3",
    name: "Classic Leather Messenger Bag",
    category: "Travel",
    price: 3999,
    image: IMG3,
  },
  {
    id: "4",
    name: "Luxury Leather Office Bag",
    category: "Bags",
    price: 5499,
    image: IMG4,
  },
  {
    id: "5",
    name: "Genuine Leather Sling Bag",
    category: "Bags",
    price: 2499,
    image: IMG5,
  },
  {
    id: "6",
    name: "Premium Leather Card Holder",
    category: "Bags",
    price: 899,
    image: IMG6,
  },
  {
    id: "7",
    name: "Elegant Leather Travel Bag",
    category: "Accessories",
    price: 6999,
    image: IMG7,
  },
  {
    id: "8",
    name: "Handcrafted Leather Keychain",
    category: "Bags",
    price: 399,
    image: IMG8,
  },

];
