import React from 'react'
import FeatureCard from './FeatureCard'

function FeaturesSection() {
    const features = [
        {
          imgSrc: "https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg",
          imgAlt: "Luxury Chair",
          h1:"Timeless Design",
          h2: "We blend comfort, quality, and style into timeless furniture pieces.",
        }, 
        {
          imgSrc: "https://ak1.ostkcdn.com/images/products/is/images/direct/94559ce073cff53d9dbe3813bb05427d166646ef/31.29%22Modern-Retro-Splicing-Round-Coffee-Table.jpg?imwidth=714&impolicy=medium",
          imgAlt: "Wooden Table",
          h1: "Premium Materials",
          h2:     "Crafted with sustainably sourced wood and high-end materials.",
        },
        {
          imgSrc: "https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg",
          imgAlt: "Cozy Sofa",
          h1: "Customer First",
          h2: "Enjoy fast delivery, responsive support, and a seamless experience."
        }
      ]
  return (
    
    <section className="features">
    {features.map((feature) => (
      <FeatureCard feature={feature} />
    ))}
  </section>
  )
}

export default FeaturesSection