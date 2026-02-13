"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";

interface FloatingCard {
  id: string;
  title: string;
  image: string;
  rating: number;
  reviews: number;
  position: { top?: string; bottom?: string; left?: string; right?: string };
  delay: number;
  size: "sm" | "md" | "lg";
}

const floatingCards: FloatingCard[] = [
  {
    id: "1",
    title: "Woodland Whimsy Herbal Sachets",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&h=200&fit=crop",
    rating: 4.8,
    reviews: 622,
    position: { top: "8%", left: "5%" },
    delay: 0,
    size: "lg",
  },
  {
    id: "2",
    title: "Artisan Ceramic Vase",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200&h=200&fit=crop",
    rating: 4.9,
    reviews: 7000,
    position: { top: "5%", right: "8%" },
    delay: 0.2,
    size: "lg",
  },
  {
    id: "3",
    title: "Geometric Brutalist Bookend",
    image: "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=200&h=200&fit=crop",
    rating: 4.7,
    reviews: 58,
    position: { bottom: "20%", left: "8%" },
    delay: 0.4,
    size: "md",
  },
  {
    id: "4",
    title: "Sakura Tea Infuser",
    image: "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=200&h=200&fit=crop",
    rating: 4.6,
    reviews: 57,
    position: { bottom: "15%", right: "5%" },
    delay: 0.6,
    size: "lg",
  },
  {
    id: "5",
    title: "Vintage Collection",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop",
    rating: 4.5,
    reviews: 234,
    position: { top: "35%", left: "2%" },
    delay: 0.3,
    size: "sm",
  },
  {
    id: "6",
    title: "Natural Beauty Set",
    image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=200&h=200&fit=crop",
    rating: 4.9,
    reviews: 445,
    position: { top: "30%", right: "3%" },
    delay: 0.5,
    size: "sm",
  },
];

function FloatingProductCard({ card }: { card: FloatingCard }) {
  const sizeClasses = {
    sm: "w-32 p-2",
    md: "w-44 p-3",
    lg: "w-56 p-4",
  };

  const imageSizes = {
    sm: "h-20",
    md: "h-28",
    lg: "h-36",
  };

  return (
    <div
      className={`absolute ${sizeClasses[card.size]} rounded-2xl bg-white shadow-lg border border-border/50 animate-float cursor-pointer transition-transform hover:scale-105 hover:shadow-xl`}
      style={{
        ...card.position,
        animationDelay: `${card.delay}s`,
      }}
    >
      <div className={`${imageSizes[card.size]} w-full rounded-xl overflow-hidden bg-secondary mb-2`}>
        <img
          src={card.image}
          alt={card.title}
          className="h-full w-full object-cover"
        />
      </div>
      <p className="text-xs font-medium text-foreground truncate">{card.title}</p>
      <div className="flex items-center gap-1 mt-1">
        <div className="flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`text-xs ${i < Math.floor(card.rating) ? "text-yellow-400" : "text-gray-200"}`}
            >
              ★
            </span>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">({card.reviews.toLocaleString()})</span>
      </div>
    </div>
  );
}

export function ShimmerLanding({ onEnter }: { onEnter: () => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleEnter = useCallback(() => {
    setIsExiting(true);
    // Wait for exit animation to complete before transitioning
    setTimeout(() => {
      onEnter();
    }, 800);
  }, [onEnter]);

  return (
    <div 
      className={`relative min-h-screen bg-background overflow-hidden transition-all duration-700 ${
        isExiting ? "bg-primary" : ""
      }`}
    >
      {/* Animated background gradient overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/10 transition-opacity duration-700 ${
          isExiting ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Floating product cards */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingCards.map((card, index) => (
          <div 
            key={card.id} 
            className={`pointer-events-auto transition-all duration-700 ${
              isExiting 
                ? "opacity-0 scale-75" 
                : ""
            }`}
            style={{
              transitionDelay: isExiting ? `${index * 50}ms` : "0ms",
            }}
          >
            <FloatingProductCard card={card} />
          </div>
        ))}
      </div>

      {/* Expanding circle animation on exit */}
      <div
        className={`fixed inset-0 z-20 flex items-center justify-center pointer-events-none ${
          isExiting ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className={`rounded-full bg-primary transition-all duration-700 ease-out ${
            isExiting ? "scale-[50]" : "scale-0"
          }`}
          style={{ width: "100px", height: "100px" }}
        />
      </div>

      {/* Sparkle particles on exit */}
      {isExiting && (
        <div className="fixed inset-0 z-30 pointer-events-none overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <Sparkles
              key={i}
              className="absolute text-white animate-sparkle-fly"
              style={{
                left: `${50 + (Math.random() - 0.5) * 40}%`,
                top: `${50 + (Math.random() - 0.5) * 40}%`,
                animationDelay: `${i * 50}ms`,
                fontSize: `${16 + Math.random() * 16}px`,
              }}
            />
          ))}
        </div>
      )}

      {/* Center content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
        {/* Logo and title */}
        <div
          className={`mb-8 flex flex-col items-center transition-all duration-700 ${
            isExiting 
              ? "opacity-0 scale-110 -translate-y-8" 
              : isVisible 
                ? "opacity-100 translate-y-0 scale-100" 
                : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex items-center justify-center mb-6">
            <Image
              src="/logo.png"
              alt="Shimmer Logo"
              width={100}
              height={100}
              className="h-24 w-24 object-contain"
            />
          </div>
          <h1 className="text-6xl md:text-8xl font-bold text-primary tracking-tight text-center">
            Shimmer
          </h1>
          <p className={`mt-3 text-muted-foreground text-lg text-center transition-all duration-500 delay-500 ${
            isVisible && !isExiting ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            Discover unique finds from AI merchants
          </p>
        </div>

        {/* Enter button */}
        <button
          onClick={handleEnter}
          disabled={isExiting}
          className={`group relative flex items-center gap-3 h-14 md:h-16 px-8 md:px-12 rounded-full bg-primary text-white text-lg font-medium shadow-lg transition-all duration-700 hover:scale-105 hover:shadow-xl hover:shadow-primary/25 active:scale-95 disabled:pointer-events-none ${
            isExiting 
              ? "opacity-0 scale-150" 
              : isVisible 
                ? "opacity-100 translate-y-0" 
                : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: isExiting ? "0ms" : "300ms" }}
        >
          {/* Button shimmer effect */}
          <span className="absolute inset-0 rounded-full overflow-hidden">
            <span className="absolute inset-0 -translate-x-full animate-button-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </span>
          <span className="relative flex items-center gap-3">
            Start Shopping
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </button>
      </div>
    </div>
  );
}
