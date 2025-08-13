




"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "react-bootstrap";
import { backendBaseUrl, userId, templateId } from "../../lib/config";

export default function TeamPreview() {
  const router = useRouter();
  const [team, setTeam] = useState([]);

  useEffect(() => {
    fetch(`${backendBaseUrl}/api/team/${userId}/${templateId}`)
      .then((res) => res.json())
      .then((data) => {
        setTeam(Array.isArray(data) ? data : []);
      });
  }, []);

  return (
    <div
      className="d-flex w-100 bg-white shadow-sm"
      style={{
        width: "896px",
        height: "290px",
        borderRadius: "20px",
        overflow: "hidden",
      }}
    >
      {/* Left: First team member image */}
      <div
        style={{
          width: "50%",
          height: "127%",
          backgroundImage:
            team[0]?.imageUrl
              ? `url(${backendBaseUrl}${team[0].imageUrl})`
              : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {!team[0]?.imageUrl && (
          <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white bg-secondary">
            No Image
          </div>
        )}
      </div>

      {/* Right: Team content */}
      <div
        className="d-flex flex-column justify-content-center p-4"
        style={{ width: "50%", height: "100%", overflowY: "auto" }}
      >
        <h5 className="fw-bold text-uppercase mb-2">Meet Our Team</h5>
        {team.slice(0, 2).map((member, idx) => (
          <div key={idx} className="mb-2">
            <strong>{member.name}</strong> –{" "}
            <span className="text-muted">
              {member.role || member.profession}
            </span>
          </div>
        ))}

        {/* <Button
          size="sm"
          variant="outline-dark"
          onClick={() => router.push("/editorpages/teamS")}
        >
          ✏️ Edit Team
        </Button> */}
      </div>
    </div>
  );
}
