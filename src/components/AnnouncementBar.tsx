"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { getStore } from "@/lib/medusa";

// Type for announcement bar configuration  
interface AnnouncementBarConfig {
    enabled: boolean;
    message: string;
    link: string;
}

interface StoreMetadata {
    announcement_bar?: AnnouncementBarConfig;
}

export default function AnnouncementBar() {
    const [config, setConfig] = useState<AnnouncementBarConfig | null>(null);
    const [isVisible, setIsVisible] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchConfig() {
            try {
                console.log("[AnnouncementBar] Fetching store config...");
                const store = await getStore();
                console.log("[AnnouncementBar] Store response:", store);

                const metadata = store?.metadata as StoreMetadata | undefined;
                const announcementBar = metadata?.announcement_bar;

                console.log("[AnnouncementBar] Metadata:", metadata);
                console.log("[AnnouncementBar] AnnouncementBar config:", announcementBar);

                if (announcementBar && announcementBar.enabled && announcementBar.message) {
                    setConfig(announcementBar);
                    console.log("[AnnouncementBar] Config set, will display banner");
                } else {
                    console.log("[AnnouncementBar] No valid config found, banner will not display");
                }
            } catch (error) {
                console.error("[AnnouncementBar] Failed to fetch config:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchConfig();
    }, []);

    // Don't render if loading, not configured, or dismissed
    if (isLoading || !config || !isVisible) {
        return null;
    }

    const content = (
        <span className="text-sm font-medium tracking-wide">{config.message}</span>
    );

    return (
        <div className="fixed top-0 left-0 right-0 bg-charcoal text-white z-[100]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-center py-2.5 relative">
                    {config.link ? (
                        <Link
                            href={config.link}
                            className="hover:underline transition-all duration-200 hover:opacity-90"
                        >
                            {content}
                        </Link>
                    ) : (
                        content
                    )}

                    {/* Close Button */}
                    <button
                        onClick={() => setIsVisible(false)}
                        className="absolute right-2 sm:right-4 p-1.5 hover:bg-white/10 rounded-full transition-colors"
                        aria-label="Close announcement"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
