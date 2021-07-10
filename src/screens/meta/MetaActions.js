import React, { useState } from "react";
import {
  Card,
  Dropdown,
  ButtonGroup,
  Button,
} from "react-bootstrap";
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
    <Card className="w-50">
      <Card.Header className="text-center">
        <Dropdown as={ButtonGroup}>
          <Button variant="primary">{action}</Button>
          <Dropdown.Toggle split variant="primary" id="dropdown-split-basic" />
          <Dropdown.Menu>
            <Dropdown.Item as="button" onClick={() => setAction("City")}>
              Cities
            </Dropdown.Item>
            <Dropdown.Item as="button" onClick={() => setAction("Category")}>
              Categories
            </Dropdown.Item>
            <Dropdown.Item
              as="button"
              onClick={() => setAction("Subscription")}
            >
              Vendor Subscription
            </Dropdown.Item>
            <Dropdown.Item as="button" onClick={() => setAction("Topup")}>
              Customer TopUps
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Card.Header>
      <Card.Body>
        <SwitchActionLinks></SwitchActionLinks>
        <hr />
        <div className="w-100 text-center mt-3">
          <Link to="/">Dashboard</Link>
        </div>
      </Card.Body>
    </Card>
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
