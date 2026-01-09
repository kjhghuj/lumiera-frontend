"use client";

import { useState } from "react";
import { Navbar, Footer, SearchOverlay, AgeVerificationModal, ChatWidget } from "@/components";
import { useCart, useRegion } from "@/lib/providers";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { cartCount } = useCart();
  const { region } = useRegion();

  return (
    <>
      <AgeVerificationModal />
      <Navbar cartCount={cartCount} onSearchClick={() => setIsSearchOpen(true)} />
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        regionId={region?.id}
      />
      <main className="flex-grow">{children}</main>
      <ChatWidget />
      <Footer />
    </>
  );
}
