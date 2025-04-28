import React from "react";
import "./HomePage.css";
import Hero from "../../components/home/Hero";
import FeaturesSection from "../../components/home/FeaturesSection";

const HomePage = () => {
  return (
    <div className="home-container">
      <Hero />
      <FeaturesSection />
    </div>
  );
};

export default HomePage;

