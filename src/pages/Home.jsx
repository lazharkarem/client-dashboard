import React, { memo } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import Categories from "../components/Categories";
import ProductRecommande from "../components/ProductRecommande";
import Banners from "../components/Banners";
import Popular from "../components/Popular";
import Waves from "../components/Waves";

// Card component optimisé
const FeatureCard = memo(({ bgImage, bgColor, route, label, className = "" }) => {
  const navigate = useNavigate();

  const handleClick = () => navigate(route);

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigate(route);
    }
  };

  return (
    <div
      className={`
        border rounded-2xl shadow-xls h-40  lg:h-56 
        bg-cover md:bg-contain bg-no-repeat bg-center
        hover:scale-105 transition-all duration-300 
        hover:brightness-110 hover:shadow-2xl
        cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-300
        ${bgColor} ${bgImage} ${className}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={label}
    />
  );
});
FeatureCard.displayName = "FeatureCard";

const Home = () => {
  return (
    <div className="home-container w-full">
      <main className="w-full ">
        {/* Hero Section */}
        <section aria-label="Hero banners">
          <Waves />
        </section>
        
    

        {/* Featured Actions Section */}
        <section
          className="grid grid-cols-2 lg:grid-cols-2 -mt-24 lg:m-2 gap-2"
          aria-label="Featured actions"
        >
          <FeatureCard
            bgImage="bg-[url('../assets/mydealsImg.png')]"
            bgColor="bg-blue-360"
            route="/MesDeals"
            label="Go to My Deals - Special offers and discounts"
          />
          <FeatureCard
            bgImage="bg-[url('../assets/recommnededImg.png')]"
            bgColor="bg-orange-360"
            route="/Catalogue"
            label="Go to Catalogue - Browse recommended products"
          />
        </section>

        {/* Popular Products Section */}
        <section aria-label="Popular products">
          <Popular />
        </section>

        {/* Recommended Products Section */}
        <section aria-label="Recommended products">
          <ProductRecommande />
        </section>
      </main>
    </div>
  );
};

export default memo(Home);
