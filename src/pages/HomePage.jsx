import Layout from "../components/layout/Layout";
import Hero from "../components/home/Hero/Hero";
import FeaturedProducts from "../components/home/FeaturedProducts";

function HomePage() {
  return (
    <Layout>
      {/* ================= HERO ================= */}
      <Hero />

      {/* ================= FEATURED PRODUCTS ================= */}
      <FeaturedProducts />
    </Layout>
  );
}

export default HomePage;
