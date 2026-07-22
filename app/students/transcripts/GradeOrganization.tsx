"use client";
import './GradeTranscript.css';
import React from "react";

export interface OrgData {
  name: string;
  role:string;
  address: string;
  phone: string;
  email: string;
  website: string;
}
interface ContactColumnsProps{
  showPresident: boolean;
  orgData: OrgData | null;
  loading?: boolean;
}
const ContactColumns: React.FC<ContactColumnsProps> = ({
  showPresident,
  orgData,
  loading = false,
}) => {
  if (loading) return <p>Loading contact info...</p>;
  if (!orgData) return <p>No organization data found.</p>;

  return (<div>{showPresident?
    <p className='president'>
            {orgData.name}
            <br />
            {orgData.role}
          </p> : <></>}
    <div className="contact-columns">
      <div className="column address">
        {/* assuming address is multiline string or you can split by \n if needed */}
        {orgData.address.split('\n').map((line, i) => (
          <React.Fragment key={i}>
            {line} {' '}
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
export default ContactColumns
