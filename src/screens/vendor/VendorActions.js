import React from "react";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function VendorActions() {
  return (
    <Card className="w-50">
      <Card.Body>
        <Link to="/createVendor" className="btn btn-primary w-100 mt-3">
          Create Vendor Profile
        </Link>
        <Link to="/modifyVendor" className="btn btn-info w-100 mt-3">
          Modify Verified Vendor Profile
        </Link>
        <Link to="/viewVendors" className="btn btn-secondary w-100 mt-3">
          View Vendor Profiles
        </Link>
        <hr />
        <div className="w-100 text-center mt-3">
          <Link to="/">Dashboard</Link>
        </div>
      </Card.Body>
    </Card>
  );
}
