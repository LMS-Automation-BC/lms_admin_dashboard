"use client";
import './GradeTranscript.css';
import React, { useEffect, useState } from "react";

interface OrgData {
  president: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

export default function ContactColumns() {
  const [orgData, setOrgData] = useState<OrgData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/organization")
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => setOrgData(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading contact info...</p>;
  if (!orgData) return <p>No organization data found.</p>;

  return (<div>
    <p style={{ fontWeight: "bold" }}>
            {orgData.president}
            <br />
            President
          </p>
          <br></br>
    <div className="contact-columns">
      <div className="column address">
        {/* assuming address is multiline string or you can split by \n if needed */}
        {orgData.address.split('\n').map((line, i) => (
          <React.Fragment key={i}>
            {line}
            <br />
          </React.Fragment>
        ))}
      </div>
      <div className="column phone">
        Phone: {orgData.phone} <br />
        <a href={orgData.website.startsWith('http') ? orgData.website : `https://${orgData.website}`} target="_blank" rel="noopener noreferrer">
          {orgData.website}
        </a>
      </div>
      <div className="column email">
        <a href={`mailto:${orgData.email}`}>
          {orgData.email}
        </a>
      </div>
    </div></div>
  );
}
