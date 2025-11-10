"use client";

import React from "react";
import "./organization.css";
import { useOrganization } from "./OrganizationContext";


export default function OrganizationComponent() {
  const { organization, loading, setOrganization } = useOrganization();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setOrganization(
      (prev) =>
        ({
          ...prev,
          [name]: value,
        } as Organization)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!organization) return;

  try {
    organization.id=1
    const response = await fetch('https://brookes-jobs-hxgbhghvajeyefb7.canadacentral-01.azurewebsites.net/api/organization', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(organization)
    });

    const result = await response.json();

    if (response.ok && result.success) {
      alert("Data saved!");
    } else {
      alert("Failed to save data: " + (result.error || "Unknown error"));
    }
  } catch (error) {
    console.error("Failed to submit form:", error);
    alert("Error submitting data. Check console for details.");
  }
};

  if (loading)
    return <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading...</p>;

  return (
    <main className="container">
      <h2 className="heading">Edit Organization Info</h2>
      <form onSubmit={handleSubmit} className="form">
         <label className="label">
          Role
          <input
            className="input"
            name="role"
            placeholder="role"
            value={organization?.role}
            onChange={handleChange}
            required
          />
        </label>
        <label className="label">
          Name
          <input
            className="input"
            name="name"
            placeholder="name"
            value={organization?.name}
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
            value={organization?.address}
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
            value={organization?.phone}
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
            value={organization?.email}
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
            value={organization?.website}
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
