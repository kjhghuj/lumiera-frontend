import Link from "next/link";
import { ShoppingBagIcon } from "./utils";

export default function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="text-charcoal-light mb-6">
        <ShoppingBagIcon />
      </div>
      <h2 className="font-serif text-2xl text-charcoal mb-3">
        Your cart is empty
      </h2>
      <p className="text-charcoal-light text-center max-w-md mb-8">
        Looks like you haven&apos;t added any items to your cart yet.
        Explore our collection and find something you&apos;ll love.
      </p>
      <Link
        href="/shop"
        className="bg-charcoal text-white px-8 py-3 rounded-full hover:bg-charcoal-light transition-colors font-medium"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
