



"use client";

import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { useRouter } from "next/router";
import { backendBaseUrl, userId, templateId } from "../../lib/config";

export default function AppointmentPreview() {
  const router = useRouter();

  const [appointment, setAppointment] = useState({
    title: "",
    subtitle: "",
    officeAddress: "",
    officeTime: "",
    backgroundImage: "",
  });

  useEffect(() => {
    fetch(`${backendBaseUrl}/api/appointment/${userId}/${templateId}`)
      .then((res) => res.json())
      .then(setAppointment)
      .catch((err) => console.error("❌ Failed to fetch appointment", err));
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
      {/* Left: Background image */}
      <div
        style={{
          width: "50%",
          height: "127%",
          backgroundImage: appointment.backgroundImage
            ? `url(${backendBaseUrl}${appointment.backgroundImage})`
            : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Right: Content */}
      <div
        className="d-flex flex-column justify-content-center p-4"
        style={{ width: "50%", height: "100%", overflowY: "auto" }}
      >
        <h5 className="fw-bold text-uppercase mb-2">
          {appointment.title || "Appointment"}
        </h5>
        <p className="mb-2">{appointment.subtitle || "Subtitle goes here..."}</p>
        <p className="mb-1">
          <strong>📍 Address:</strong>{" "}
          {appointment.officeAddress || "Not specified"}
        </p>
        <p className="mb-3">
          <strong>⏰ Time:</strong> {appointment.officeTime || "Not specified"}
        </p>

        {/* <Button
          size="sm"
          variant="outline-dark"
          onClick={() => router.push("/editorpages/appointmentS")}
        >
          ✏️ Edit Appointment
        </Button> */}
      </div>
    </div>
  );
}
