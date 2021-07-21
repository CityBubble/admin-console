import React, { useState } from "react";
import { Card, CardDeck } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function MetaActions() {
  const [action, setAction] = useState("Choose Action");

  function SwitchActionLinks() {
    switch (action) {
      case "City":
        return renderCityOptions();
      case "Category":
        return renderCategoryOptions();
      case "Subscription":
        return renderSubscriptionOptions();
      case "Topup":
        return renderTopupOptions();
      default:
        return "";
    }
  }

  return (
    <div>
      <CardDeck className="w-100">
        <Card className="m-2" onClick={() => setAction("City")}>
          <Card.Header>Cities</Card.Header>
        </Card>
        <Card className="m-2" onClick={() => setAction("Category")}>
          <Card.Header>Categories</Card.Header>
        </Card>
        <Card className="m-2" onClick={() => setAction("Subscription")}>
          <Card.Header>Vendor Subscription</Card.Header>
        </Card>
        <Card className="m-2" onClick={() => setAction("Topup")}>
          <Card.Header>Customer TopUps</Card.Header>
        </Card>
      </CardDeck>

      <Card className="w-50 text-center mt-3">
        <Card.Body>
          <Card.Header>{action}</Card.Header>
          <SwitchActionLinks></SwitchActionLinks>
          <hr />
          <div className="w-100 text-center mt-3">
            <Link to="/">Dashboard</Link>
          </div>
        </Card.Body>
      </Card>
    </div>
  );

  function renderCityOptions() {
    return (
      <div>
        <Link to="/addCity" className="btn btn-success w-100 mt-3">
          Add City
        </Link>
      </div>
    );
  }

  function renderCategoryOptions() {
    return (
      <div>
        <Link to="/addParent" className="btn btn-success w-100 mt-3">
          Add Parent
        </Link>
        <Link to="/addCategory" className="btn btn-dark w-100 mt-3">
          Add Category
        </Link>
      </div>
    );
  }

  function renderSubscriptionOptions() {
    return (
      <div>
        <Link to="/addSubscription" className="btn btn-success w-100 mt-3">
          Add Subscription
        </Link>
      </div>
    );
  }

  function renderTopupOptions() {
    return (
      <div>
        <Link to="/addTopup" className="btn btn-success w-100 mt-3">
          Add Top Up
        </Link>
      </div>
    );
  }
}
