"use client";

import React, { useEffect, useState } from "react";
import "./organization.css";

export default function OrgPage() {
  const [formData, setFormData] = useState({
    president: "",
    address: "",
    phone: "",
    email: "",
    website: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/organization")
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => setFormData(data))
      .catch(() => console.log("Organization not found"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/organization", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await res.json();
    alert(result.message || "Saved!");
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading...</p>;

  return (
    <main className="container">
      <h2 className="heading">Edit Organization Info</h2>
      <form onSubmit={handleSubmit} className="form">
        <label className="label">
          President
          <input
            className="input"
            name="president"
            placeholder="President"
            value={formData.president}
            onChange={handleChange}
            required
          />
        </label>

        <label className="label">
          Address
          <textarea
            className="input textarea"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </label>

        <label className="label">
          Phone
          <input
            className="input"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </label>

        <label className="label">
          Email
          <input
            className="input"
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </label>

        <label className="label">
          Website
          <input
            className="input"
            name="website"
            placeholder="Website"
            value={formData.website}
            onChange={handleChange}
          />
        </label>

        <button type="submit" className="button">
          Save
        </button>
      </form>
    </main>
  );
}
