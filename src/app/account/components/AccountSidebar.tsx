import { User as UserIcon, Package, MapPin, LogOut, Ticket } from "lucide-react";

interface AccountSidebarProps {
  activeTab: "profile" | "orders" | "addresses" | "coupons";
  setActiveTab: (tab: "profile" | "orders" | "addresses" | "coupons") => void;
  handleLogout: () => void;
}

export function AccountSidebar({ activeTab, setActiveTab, handleLogout }: AccountSidebarProps) {
  return (
    <div className="md:col-span-1">
      <nav className="space-y-2">
        <button
          onClick={() => setActiveTab("profile")}
          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeTab === "profile" ? "bg-terracotta/10 text-terracotta" : "text-charcoal hover:bg-gray-50"
            }`}
        >
          <UserIcon size={18} />
          <span className="text-sm">Profile</span>
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeTab === "orders" ? "bg-terracotta/10 text-terracotta" : "text-charcoal hover:bg-gray-50"
            }`}
        >
          <Package size={18} />
          <span className="text-sm">Orders</span>
        </button>
        <button
          onClick={() => setActiveTab("addresses")}
          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeTab === "addresses" ? "bg-terracotta/10 text-terracotta" : "text-charcoal hover:bg-gray-50"
            }`}
        >
          <MapPin size={18} />
          <span className="text-sm">Addresses</span>
        </button>
        <button
          onClick={() => setActiveTab("coupons")}
          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeTab === "coupons" ? "bg-terracotta/10 text-terracotta" : "text-charcoal hover:bg-gray-50"
            }`}
        >
          <Ticket size={20} />
          <span className="text-sm">Coupons</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-left text-charcoal hover:bg-red-50 hover:text-red-600 transition-colors"

        >
          <LogOut size={18} />
          <span className="text-sm">Sign Out</span>
        </button>
      </nav>
    </div>
  );
}
