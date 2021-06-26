import React from "react";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function ReviewActions() {
  return (
    <Card className="w-50">
      <Card.Body>
        <Link to="/reviewVendor" className="btn btn-primary w-100 mt-3">
          Review Vendor Profile
        </Link>
        <Link to="/reviewAd" className="btn btn-secondary w-100 mt-3">
          Review Ads
        </Link>
        <hr />
        <div className="w-100 text-center mt-3">
          <Link to="/">Dashboard</Link>
        </div>
      </Card.Body>
    </Card>
  );
}
