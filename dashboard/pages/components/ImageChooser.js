// pages/components/ImageChooser.js
"use client";

import { useEffect, useRef, useState } from "react";
import { Form, Image } from "react-bootstrap";

/**
 * Shows a preview as soon as a file is chosen, but DOES NOT upload.
 * Parent receives (file, objectUrl) via onPick.
 */
export default function ImageChooser({ label = "Image", initialUrl = "", onPick }) {
  const [previewUrl, setPreviewUrl] = useState(initialUrl);
  const lastObjectUrlRef = useRef(null);

  // reset preview when initialUrl changes (e.g., after save)
  useEffect(() => { setPreviewUrl(initialUrl); }, [initialUrl]);

  // revoke any leftover ObjectURL on unmount
  useEffect(() => () => {
    if (lastObjectUrlRef.current) URL.revokeObjectURL(lastObjectUrlRef.current);
  }, []);

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    if (lastObjectUrlRef.current) URL.revokeObjectURL(lastObjectUrlRef.current);
    lastObjectUrlRef.current = objectUrl;

    setPreviewUrl(objectUrl);
    onPick?.(file, objectUrl);       // ← parent keeps draftFile; no upload here
  };

  return (
    <div>
      {previewUrl ? (
        <div className="mb-2">
          <Image src={previewUrl} alt="preview" fluid style={{ maxHeight: 220, objectFit: "cover" }} />
        </div>
      ) : null}

      <Form.Group controlId="imageFile">
        <Form.Label className="fw-semibold">{label}</Form.Label>
        <Form.Control type="file" accept="image/*" onChange={handleChange} />
      </Form.Group>
    </div>
  );
}
