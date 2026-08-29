import { useEffect } from "react";

import Layout from "../components/layout/Layout";
import Hero from "../components/home/Hero/Hero";
import FeaturedProducts from "../components/home/FeaturedProducts";

function HomePage() {
  useEffect(() => {
    const redirectKey = "elyvorr_home_scroll_done";

    // Agar is session mein already scroll ho chuka hai,
    // to dobara automatically scroll mat karo.
    if (sessionStorage.getItem(redirectKey) === "true") {
      return;
    }

    const timer = setTimeout(() => {
      const perfumeSection = document.getElementById("featured-products");

      if (perfumeSection) {
        perfumeSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        sessionStorage.setItem(redirectKey, "true");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout>
      <Hero />
      <FeaturedProducts />
    </Layout>
  );
}

export default HomePage;
