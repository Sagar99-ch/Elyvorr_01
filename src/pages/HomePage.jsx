import Layout from "../components/layout/Layout";
import Hero from "../components/home/Hero/Hero";
// import Categories from "../components/home/Categories";
import FeaturedProducts from "../components/home/FeaturedProducts";

function HomePage() {
  return (
    <Layout>
      <Hero />

      {/* <Categories /> */}

      <FeaturedProducts />
    </Layout>
  );
}

export default HomePage;
