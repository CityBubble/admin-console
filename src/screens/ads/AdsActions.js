import React from "react";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function AdsActions() {
  return (
    <Card className="w-50">
      <Card.Body>
        <Link to="/createAd" className="btn btn-primary w-100 mt-3">
          Create Ad
        </Link>
        <Link to="/viewAds" className="btn btn-secondary w-100 mt-3">
          View Ad
        </Link>
        <Link to="/modifyAd" className="btn btn-info w-100 mt-3">
          Modify Ad
        </Link>
        <div className="w-100 text-center mt-3">
          <Link to="/">Dashboard</Link>
        </div>
      </Card.Body>
    </Card>
  );
}
