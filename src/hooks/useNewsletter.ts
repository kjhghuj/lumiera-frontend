import { useState, useRef } from "react";
import { type TurnstileInstance } from "@marsidev/react-turnstile";

type Status = "idle" | "success" | "error";

export function useNewsletter() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<Status>("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const turnstileRef = useRef<TurnstileInstance>(null);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

    const subscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        if (!turnstileToken) {
            setErrorMessage("Please complete the security check.");
            return;
        }

        setIsLoading(true);
        setStatus("idle");
        setErrorMessage("");

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/newsletter`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-publishable-api-key":
                            process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
                    },
                    body: JSON.stringify({
                        email,
                        turnstile_token: turnstileToken,
                    }),
                }
            );

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

    const reset = () => {
        setStatus("idle");
        setEmail("");
        setErrorMessage("");
        turnstileRef.current?.reset();
        setTurnstileToken(null);
    }

    return {
        email,
        setEmail,
        isLoading,
        status,
        errorMessage,
        subscribe,
        turnstileRef,
        setTurnstileToken,
        setErrorMessage,
        reset
    };
}
