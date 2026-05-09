import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import siteCssUrl from "../textile-site.css?url";
import redesignCssUrl from "../textile-redesign.css?url";
import siteBody from "../textile-site.body.html?raw";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fabricore — Modern Textile Studio" },
      {
        name: "description",
        content:
          "Modern textile bundles and fabric collections for fashion, retail, interiors, and creative projects.",
      },
      { property: "og:title", content: "Fabricore — Modern Textile Studio" },
      {
        property: "og:description",
        content: "Premium textile bundles, collections, and custom fabrics.",
      },
      {
        property: "og:image",
        content:
          "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=1200&q=80",
      },
      {
        name: "twitter:image",
        content:
          "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "https://cdn-icons-png.flaticon.com/512/3082/3082037.png",
      },
      {
        rel: "apple-touch-icon",
        href: "https://cdn-icons-png.flaticon.com/512/5998/5998391.png",
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap",
      },
      { rel: "stylesheet", href: siteCssUrl },
      { rel: "stylesheet", href: redesignCssUrl },
    ],
  }),
  component: Index,
});

function Index() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Inject the site's vanilla JS once the markup is mounted
    const s1 = document.createElement("script");
    s1.src = "/textile-site.js";
    s1.async = false;
    document.body.appendChild(s1);

    const s2 = document.createElement("script");
    s2.src = "/hero-anim.js";
    s2.async = false;
    document.body.appendChild(s2);

    return () => {
      s1.remove();
      s2.remove();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      // The HTML is authored & owned by us — safe to inject as the page shell
      dangerouslySetInnerHTML={{ __html: siteBody }}
    />
  );
}
