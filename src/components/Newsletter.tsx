"use client";

import { useState, useRef } from "react";
import { MoveRight, Loader2 } from "lucide-react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

export default function Newsletter() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const turnstileRef = useRef<TurnstileInstance>(null);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        // Trigger Turnstile if no token yet
        if (!turnstileToken) {
            // If invisible mode, we might need to explicit execution, 
            // but for managed/default, the user should interact or it auto-runs.
            // Let's rely on the token being present or handling the "please verify" state.
            // For a footer input, usually 'managed' is fine.
            setErrorMessage("Please complete the security check.");
            return;
        }

        setIsLoading(true);
        setStatus("idle");
        setErrorMessage("");

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/newsletter`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
                },
                body: JSON.stringify({
                    email,
                    turnstile_token: turnstileToken,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            setStatus("success");
            setEmail("");
            turnstileRef.current?.reset();
            setTurnstileToken(null);
        } catch (error: any) {
            console.error("Newsletter subscription error:", error);
            setStatus("error");
            setErrorMessage(error.message || "Failed to subscribe");
            turnstileRef.current?.reset();
            setTurnstileToken(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full">
            <h5 className="uppercase tracking-widest text-xs font-bold text-terracotta mb-6">
                Unlock 15% Off Your First Ritual
            </h5>
            <p className="text-sm text-charcoal-light mb-4">
                Join the Lumiera community for intimate wellness tips and exclusive offers. Unsubscribe anytime.
            </p>

            {status === "success" ? (
                <div className="p-4 bg-green-50 text-green-800 text-sm rounded">
                    Thank you for subscribing!
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="relative">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-transparent border-b border-gray-300 py-3 text-sm placeholder-gray-400 focus:outline-none focus:border-terracotta transition-colors"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-charcoal text-white py-2 text-xs uppercase tracking-widest hover:bg-terracotta transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            "Get My Code"
                        )}
                    </button>

                    {status === "error" && (
                        <p className="text-xs text-red-500">{errorMessage}</p>
                    )}

                    <div className="mt-2 origin-top-left scale-85" style={{ height: "55px" }}> {/* Scale down to compress height */}
                        <Turnstile
                            ref={turnstileRef}
                            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
                            onSuccess={(token) => setTurnstileToken(token)}
                            onError={() => setErrorMessage("Security check failed. Please try again.")}
                            onExpire={() => setTurnstileToken(null)}
                            options={{
                                theme: "light",
                                size: "normal" // Switch to normal (horizontal) which is shorter (65px) than compact (120px)
                            }}
                        />
                    </div>

                    <p className="text-[10px] text-gray-400 mt-1">
                        100% Discreet & Spam-free.
                    </p>
                </form>
            )}
        </div>
    );
}
