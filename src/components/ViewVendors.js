import React, { useRef, useState } from "react";
import { Form, Button, Card, Alert, Table } from "react-bootstrap";
import { useVendorDataStore } from "../backend/datastore/vendorDatastore";
import { Link } from "react-router-dom";

export default function ViewVendors() {
  const cityRef = useRef();

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState(null);
  const [cityCode, setCityCode] = useState("null");

  const { getVendors } = useVendorDataStore();

  async function handleViewVendors(e) {
    console.log("handle ViewVendors");
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);
    setVendors(null);
    try {
      let list = await getVendors(cityRef.current.value, 10);

      if (list.length > 0) {
        const lastObj = list[list.length - 1];
        setVendors(list);
      } else {
        setError("No records found ...");
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  function renderVendors() {
    return (
      <div className="container mt-3">
        <hr />
        {vendors && vendors.length > 0 && (
          <Table
            responsive="lg"
            striped
            bordered
            hover
            variant="dark"
            size="lg"
          >
            <thead style={{ color: "#ffc93c" }}>
              <tr>
                <th>Id</th>
                <th>Name</th>
                <th>Area</th>
                <th>Category</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor, index) => {
                return (
                  <tr
                    className="mt-3"
                    key={index}
                    onClick={() => {
                      alert(vendor.name + " " + index);
                    }}
                  >
                    <td>{vendor.uid}</td>
                    <td>{vendor.name}</td>
                    <td>{vendor.area}</td>
                    <td>{vendor.category.join(", ")}</td>
                    <td style={{ color: getStatusTextColor(vendor.status) }}>
                      {vendor.status}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </div>
    );
  }

  function renderCitySelection() {
    return (
      <Card>
        <Card.Body>
          <h3 className="text-center mb-4">View Vendors </h3>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleViewVendors}>
            <Form.Group id="city">
              <Form.Control
                as="select"
                ref={cityRef}
                onChange={() => {
                  setCityCode(cityRef.current.value);
                }}
              >
                <option value="null">Select City</option>
                <option value="asr">Amritsar</option>
                <option value="chd">Chandigarh</option>
                <option value="del">New Delhi</option>
              </Form.Control>
            </Form.Group>

            <Button
              disabled={loading || cityCode === "null"}
              className="w-100"
              type="submit"
            >
              View all vendors
            </Button>
          </Form>
          <hr />
          <div className="w-100 text-center mt-3">
            <Link to="/vendors">Back</Link>
          </div>
        </Card.Body>
      </Card>
    );
  }

  function getStatusTextColor(status) {
    switch (status) {
      case "queued":
        return "#3d84b8";
      case "review":
        return "#ffab73";
      case "active":
        return "#8fd9a8";
      default:
        return "white";
    }
  }

  return (
    <div>
      {renderCitySelection()}
      {renderVendors()}
    </div>
  );
}
