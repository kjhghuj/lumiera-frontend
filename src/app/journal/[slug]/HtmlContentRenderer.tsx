import parse, { DOMNode, Element, domToReact } from "html-react-parser";
import { StoreProduct } from "@/lib/types";
import React from "react";
import InlineProductBlock from "@/components/journal/InlineProductBlock";

interface HtmlContentRendererProps {
    content: string;
    productsMap: Map<string, StoreProduct>;
    featuredProduct: StoreProduct | null | undefined;
}

export default function HtmlContentRenderer({
    content,
    productsMap,
    featuredProduct,
}: HtmlContentRendererProps) {
    const options = {
        replace: (domNode: DOMNode) => {
            // Check if node is a text node
            if (domNode.type === "text") {
                const text = domNode.data;

                // Match [product] OR [product:handle]
                const match = text.match(/\[product(?::([a-zA-Z0-9-]+))?\]/);

                if (match) {
                    const handle = match[1]; // Capture group 1 (handle) might be undefined

                    if (handle) {
                        const product = productsMap.get(handle);
                        if (product) return <InlineProductBlock product={product} />;
                    } else {
                        // specific case: [product] -> use featuredProduct
                        if (featuredProduct) return <InlineProductBlock product={featuredProduct} />;
                    }
                }
            }

            // Check if node is an element (like <p>) that solely contains the shortcode
            if (domNode instanceof Element && domNode.name === 'p') {
                const children = domNode.children;
                if (children.length === 1 && children[0].type === 'text') {
                    const text = children[0].data;
                    // Match [product] OR [product:handle] allowing whitespace
                    const match = text.match(/^\s*\[product(?::([a-zA-Z0-9-]+))?\]\s*$/);

                    if (match) {
                        const handle = match[1];
                        if (handle) {
                            const product = productsMap.get(handle);
                            if (product) return <InlineProductBlock product={product} />;
                        } else {
                            if (featuredProduct) return <InlineProductBlock product={featuredProduct} />;
                        }
                    }
                }
            }
        },
    };

    return <>{parse(content, options)}</>;
}
