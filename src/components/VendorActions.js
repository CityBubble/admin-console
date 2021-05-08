import React from "react";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function VendorActions() {
  return (
    <Card className="w-50">
      <Card.Body>
        <Link to="/view_vendors" className="btn btn-primary w-100 mt-3">
          View All Vendors
        </Link>

        <hr />
        <div className="w-100 text-center mt-3">
          <Link to="/">Dashboard</Link>
        </div>
      </Card.Body>
    </Card>
  );
}
