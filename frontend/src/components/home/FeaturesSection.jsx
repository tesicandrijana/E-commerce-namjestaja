import React from 'react'
import FeatureCard from './FeatureCard'

function FeaturesSection() {
    const features = [
        {
          imgSrc: "https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg",
          imgAlt: "Timeless Design",
          h1:"Timeless Design",
          h2: "We blend comfort, quality, and style into timeless furniture pieces.",
        }, 
        {
          imgSrc: "https://shopinspiredhome.com/cdn/shop/products/sofa-giovanni-velvet-corner-sectional-sofa-16_1500x1500_0b4bdb4d-45d0-49a2-91c2-ebb65ad8a936_1800x1800.jpg?v=1646361834",
          imgAlt: "Premium Materials",
          h1: "Premium Materials",
          h2:     "Crafted with sustainably sourced wood and high-end materials.",
        },
        {
          imgSrc: "https://transleaseinc.com/wp-content/uploads/fly-images/1339/package-delivery-hero-1920x953-c.jpg",
          imgAlt: "Customer First",
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