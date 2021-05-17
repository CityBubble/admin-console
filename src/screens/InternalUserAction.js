import React from "react";
import { Link } from "react-router-dom";
import { Card } from "react-bootstrap";

export default function InternalUserAction() {
  return (
    <Card className="w-50">
      <Card.Body>
        <Link to="/createUser" className="btn btn-primary w-100 mt-3">
          Create Internal User
        </Link>
        <Link to="/modifyUser" className="btn btn-secondary w-100 mt-3">
          Modify Internal User
        </Link>
        <hr />
        <div className="w-100 text-center mt-3">
          <Link to="/">Dashboard</Link>
        </div>
      </Card.Body>
    </Card>
  );
}
