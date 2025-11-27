import { useMemo, useState, useEffect, useRef } from "react";
import Card from "./Card";
import "./CardsContainer.css";
import data from "../data/tools.json";

const ITEMS_PER_PAGE = 32;

export default function CardsContainer({ filter }) {
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(false);
  const loaderRef = useRef(null);

  const filteredCards = useMemo(() => {
    return data.tools
      .filter((item) => filter === "all" || filter === item.category)
      .flatMap((item) => item.content)
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [filter]);

  // Reset displayed count when filter changes
  useEffect(() => {
    setDisplayedCount(ITEMS_PER_PAGE);
  }, [filter]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && displayedCount < filteredCards.length) {
          setIsLoading(true);
          // Simulate network delay
          setTimeout(() => {
            setDisplayedCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredCards.length));
            setIsLoading(false);
          }, 300);
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [displayedCount, isLoading, filteredCards.length]);

  const displayedCards = filteredCards.slice(0, displayedCount);

  return (
    <section>
      <ul role="list" className="link-card-grid">
        {displayedCards.map(({ url, title, body, tag, "date-added": dateAdded }, i) => (
          <Card
            key={`${title}-${i}`}
            href={url}
            title={title}
            body={body}
            tag={tag}
            dateAdded={dateAdded}
          />
        ))}
      </ul>
      
      {displayedCount < filteredCards.length && (
        <div ref={loaderRef} className="infinite-scroll-loader">
          {isLoading && (
            <p className="loading-text">Loading more...</p>
          )}
        </div>
      )}
    </section>
  );
}
