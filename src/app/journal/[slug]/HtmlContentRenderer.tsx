import parse, { DOMNode, Element, domToReact } from "html-react-parser";
import { StoreProduct } from "@/lib/types";
import React from "react";
import InlineProductBlock from "@/components/journal/InlineProductBlock";

interface HtmlContentRendererProps {
    content: string;
    productsMap: Map<string, StoreProduct>;
    featuredProduct: StoreProduct | null | undefined;
}

// Helper to recursively extract text from a node tree
const getText = (node: DOMNode): string => {
    if (node.type === "text") {
        // @ts-ignore - data exists on Text node
        return node.data || "";
    }
    if (node instanceof Element && node.children) {
        return node.children.map((child) => getText(child as DOMNode)).join("");
    }
    return "";
};

export default function HtmlContentRenderer({
    content,
    productsMap,
    featuredProduct,
}: HtmlContentRendererProps) {
    const options = {
        replace: (domNode: DOMNode) => {
            // Only replace block-level elements (paragraphs) to avoid <p><div> nesting errors (Hydration mismatch)
            if (domNode instanceof Element && domNode.name === "p") {
                const text = getText(domNode).trim();

                // Match [product] OR [product:handle] strictly as the only content
                const match = text.match(/^\[product(?::([a-zA-Z0-9-]+))?\]$/);

                if (match) {
                    const handle = match[1];
                    if (handle) {
                        const product = productsMap.get(handle);
                        if (product) return <InlineProductBlock product={product} />;
                    } else {
                        // [product] shortcode -> use featuredProduct
                        if (featuredProduct) return <InlineProductBlock product={featuredProduct} />;
                    }
                }
            }
        },
    };

    return <>{parse(content, options)}</>;
}
