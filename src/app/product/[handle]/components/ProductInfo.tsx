"use client";

import { useState } from "react";
import { StoreProduct } from "@/lib/types";

interface ProductInfoProps {
  product: StoreProduct;
}

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex items-center justify-between text-left"
      >
        <span className="text-xs uppercase tracking-widest text-charcoal font-medium">
          {title}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className={`w-4 h-4 text-charcoal-light transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? "max-h-96 pb-4" : "max-h-0"
        }`}
      >
        <div className="text-sm text-charcoal-light leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const hasMaterial = !!product.material;
  const hasWeight = !!product.weight;
  const hasDimensions = product.length || product.width || product.height;

  return (
    <div className="pt-6 border-t border-gray-100">
      {/* Material & Specifications */}
      {(hasMaterial || hasWeight || hasDimensions) && (
        <AccordionItem title="Material & Specifications" defaultOpen>
          <div className="space-y-3">
            {hasMaterial && (
              <div className="flex justify-between">
                <span className="text-charcoal-light">Material</span>
                <span className="text-charcoal">{product.material}</span>
              </div>
            )}
            {hasWeight && (
              <div className="flex justify-between">
                <span className="text-charcoal-light">Weight</span>
                <span className="text-charcoal">{product.weight}g</span>
              </div>
            )}
            {hasDimensions && (
              <div className="flex justify-between">
                <span className="text-charcoal-light">Dimensions</span>
                <span className="text-charcoal">
                  {[product.length, product.width, product.height]
                    .filter(Boolean)
                    .join(" × ")} mm
                </span>
              </div>
            )}
          </div>
        </AccordionItem>
      )}

      {/* Care Instructions */}
      <AccordionItem title="Care Instructions">
        <div className="space-y-2">
          <p>• Clean before and after each use with warm water and mild soap or toy cleaner</p>
          <p>• Allow to air dry completely before storage</p>
          <p>• Store in the provided pouch away from direct sunlight</p>
          <p>• Use only with water-based lubricants</p>
          <p>• Check regularly for any signs of wear or damage</p>
        </div>
      </AccordionItem>

      {/* Shipping Information */}
      <AccordionItem title="Shipping & Delivery">
        <div className="space-y-2">
          <p><strong>UK Standard Delivery:</strong> 3-5 business days (Free over £50)</p>
          <p><strong>UK Express Delivery:</strong> 1-2 business days (£9.99)</p>
          <p><strong>EU Delivery:</strong> 5-7 business days</p>
          <p className="mt-3 pt-3 border-t border-gray-100">
            All orders are shipped in 100% discreet packaging with no branding or product 
            information visible. Your bank statement will show &quot;SP-UK-STORE&quot;.
          </p>
        </div>
      </AccordionItem>

      {/* Returns Policy */}
      <AccordionItem title="Returns & Refunds">
        <div className="space-y-2">
          <p>
            We offer a 30-day return policy on all unopened items. Due to hygiene reasons, 
            we cannot accept returns on opened intimate products.
          </p>
          <p className="mt-2">
            If your item arrives damaged or faulty, please contact our customer service 
            team within 48 hours of receiving your order for a full refund or replacement.
          </p>
          <p className="mt-2">
            <a href="/returns" className="text-terracotta hover:underline">
              View full returns policy →
            </a>
          </p>
        </div>
      </AccordionItem>
    </div>
  );
}
