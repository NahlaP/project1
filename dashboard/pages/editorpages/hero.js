



"use client";

import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { useRouter } from "next/router";
import { backendBaseUrl, userId, templateId } from "../../lib/config";

export default function HeroSectionPreview() {
  const router = useRouter();
  const [hero, setHero] = useState({ content: "", imageUrl: "" });

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await fetch(`${backendBaseUrl}/api/hero/${userId}/${templateId}`);
        const data = await res.json();
        setHero(data || {});
      } catch (err) {
        console.error("❌ Failed to load hero section", err);
      }
    };
    fetchHero();
  }, []);

  return (
    <div
      className="d-flex w-100 bg-white shadow-sm"
      style={{
        width: "896px",
        height: "280px",
        borderRadius: "20px",
        overflow: "hidden",
        padding: "20px",
      }}
    >
   
      <div
        className="d-flex flex-column justify-content-center"
        style={{ width: "60%", paddingRight: "20px" }}
      >
        <h5 className="fw-bold mb-2">Hero Section</h5>
        <p className="mb-3" style={{ fontSize: "1rem", lineHeight: "1.5" }}>
          {hero.content || "Your Hero Section Content Goes Here"}
        </p>
        <div className="d-flex gap-2">
          <a href="#" className="btn btn-primary btn-sm">
            Explore More
          </a>
        
        </div>
      </div>

      {/* Right: Hero Image */}
      <div style={{ width: "40%" }}>
        {hero.imageUrl && (
          <img
            src={
              hero.imageUrl.startsWith("http")
                ? hero.imageUrl
                : `${backendBaseUrl}${hero.imageUrl}`
            }
            alt="Hero"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "12px",
            }}
          />
        )}
      </div>
    </div>
  );
}
