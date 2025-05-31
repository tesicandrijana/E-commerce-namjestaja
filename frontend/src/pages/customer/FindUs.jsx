import React from "react";
import Card from "../../components/dashboard/Card";
import "../../components/dashboard/Card.css";
import "./FindUs.css"

export default function FindUs() {
  const locations = [
  {
    number: 1,
    bgColor: "#504c4c",
    imageSrc: "/customer/entry1.jpg",
    altText: "Prodavnica u Sarajevu",
    title: "Sarajevo",
    description: "Maršala Tita 10, Sarajevo",
    workingHours: "Mon-Fri: 08:00 - 18:00, Sat: 09:00 - 14:00",
  },
  {
    number: 2,
    bgColor: "#504c4c",
    imageSrc: "/customer/entry4.jpg",
    altText: "Prodavnica u Banja Luci",
    title: "Banja Luka",
    description: "Kralja Petra I 23, Banja Luka",
    workingHours: "Mon-Fri: 09:00 - 17:00, Sat: 09:00 - 13:00",
  },
  {
    number: 3,
    bgColor: "#504c4c",
    imageSrc: "/customer/entry3.jpg",
    altText: "Prodavnica u Mostaru",
    title: "Mostar",
    description: "Rudarska 45, Mostar",
    workingHours: "Mon-Fri: 08:30 - 16:30, Sat: zatvoreno",
  },
  {
    number: 4,
    bgColor: "#504c4c",
    imageSrc: "/customer/entry2.jpg",
    altText: "Prodavnica u Tuzli",
    title: "Tuzla",
    description: "Slavka Mičića 78, Tuzla",
    workingHours: "Mon-Fri: 08:00 - 17:00, Sat: 09:00 - 13:00",
  },
];


return (
  <>
    <h3 className="locations-title">
      Feel free to visit us at these locations
    </h3>
    <div className="locations-container">
      {locations.map((loc) => (
        <Card
          key={loc.number}
          number={loc.number}
          bgColor={loc.bgColor}
          imageSrc={loc.imageSrc}
          altText={loc.altText}
          title={loc.title}
          description={loc.description}
          onClick={() => alert(`You clicked on ${loc.title} location!`)}
          workingHours={loc.workingHours}
        />
      ))}
    </div>
  </>
);

}