import { useRef } from "react";
import AgentCard from "./templates/AgentCard";

export default function AgentsCarousel(props) {
  const carouselRef = useRef(null);

  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 300; // Adjust this value to control scroll distance
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="carousel-container">
      {/* Left Arrow Button */}
      <button
        className="carousel-arrow left"
        onClick={() => scroll("left")}
        aria-label="Scroll left"
      >
        ←
      </button>

      {/* Carousel Wrapper */}
      <div className="carousel-wrapper" ref={carouselRef}>
        <div className="carousel-content">
          {props?.data?.challenges?.map((agent, index) => (
            <AgentCard char={agent} data={props?.data} key={index} />
          ))}
        </div>
      </div>

      {/* Right Arrow Button */}
      <button
        className="carousel-arrow right"
        onClick={() => scroll("right")}
        aria-label="Scroll right"
      >
        →
      </button>
    </div>
  );
}
