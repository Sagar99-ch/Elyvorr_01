import { useEffect } from "react";

import Layout from "../components/layout/Layout";
import Hero from "../components/home/Hero/Hero";
import FeaturedProducts from "../components/home/FeaturedProducts";

function HomePage() {
  useEffect(() => {
    const timer = setTimeout(() => {
      const perfumeSection = document.getElementById("featured-products");

      if (perfumeSection) {
        perfumeSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
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
