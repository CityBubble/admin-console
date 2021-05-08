import React, { useRef, useState } from "react";
import { Form, Button, Card, Alert, Table, FormLabel } from "react-bootstrap";
import { useVendorDataStore } from "../backend/datastore/vendorDatastore";
import { Link } from "react-router-dom";

export default function ViewVendors() {
  const searchFormRef = useRef();
  const cityRef = useRef();
  const statusRef = useRef();
  const categoryRef = useRef();
  const areaRef = useRef();
  const timelineRef = useRef();
  const startDateRef = useRef();
  const endDateRef = useRef();

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState(null);
  const [cityCode, setCityCode] = useState("null");
  const [timeline, setTimeline] = useState("");

  const { getVendors } = useVendorDataStore();

  function constructFilterCriteria() {
    let filterObj = {};
    const status = statusRef.current.value.trim();
    if (status.length > 2) {
      filterObj["status"] = status;
    }
    const area = areaRef.current.value.trim();
    if (area.length > 2) {
      filterObj["area"] = area;
    }
    const category = categoryRef.current.value.trim();
    if (category.length > 2) {
      filterObj["category"] = category;
    }

    if (timeline.length > 0) {
      if (startDateRef.current.value.length === 0) {
        setError("Please select From date");
        filterObj = null;
        return;
      }

      let startDate = new Date(startDateRef.current.value);
      let endDate = new Date();
      let today = new Date();
      today.setHours(today.getHours() + 5);
      today.setMinutes(today.getMinutes() + 30);

      if (startDate.getTime() > today.getTime()) {
        setError("From date cannot be after today");
        return null;
      }

      if (endDateRef.current.value.length === 0) {
        setError("Please select To date");
        return null;
      }

      endDate = new Date(endDateRef.current.value);
      if (endDate.getTime() < startDate.getTime()) {
        setError("To date cannot be before From date");
        return null;
      }
      if (endDate.getTime() > today.getTime()) {
        setError("To date cannot be after today");
        return null;
      }
      //adjusting end_date to include current selected date
      endDate.setDate(endDate.getDate() + 1);
      endDate.setSeconds(endDate.getSeconds() - 1);

      let timelineObj = { field: timeline };
      timelineObj["start_date"] = startDate;
      timelineObj["end_date"] = endDate;
      filterObj["timeline"] = timelineObj;
    }

    return filterObj;
  }

  async function handleViewVendors(e) {
    console.log("handle ViewVendors");
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);
    // setVendors(null);
    try {
      const filterObj = constructFilterCriteria();
      if (filterObj === undefined || filterObj === null) {
        console.log("aborting search request due to error");
        setLoading(false);
        return;
      }
      let list = await getVendors(cityRef.current.value, filterObj);

      if (list.length > 0) {
        const lastObj = list[list.length - 1];
        setVendors(list);
      } else {
        setError("No records found ...");
      }
    } catch (err) {
      console.log(err);
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
                {/* <th>Id</th> */}
                <th>Name</th>
                <th>Area</th>
                <th>Category</th>
                <th>Status</th>
                <th>Request Date</th>
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
                    {/* <td>{vendor.uid}</td> */}
                    <td>{vendor.name}</td>
                    <td>{vendor.area}</td>
                    <td>{vendor.category.join(", ")}</td>
                    <td style={{ color: getStatusTextColor(vendor.status) }}>
                      {vendor.status}
                    </td>
                    <td>
                      {vendor.timeline.request_date
                        .toDate()
                        .toString()
                        .substring(3, 15)}
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

  function renderFilterCriteria() {
    return (
      <Card className="w-50">
        <Card.Body>
          <h3 className="text-center mb-4">View Vendors </h3>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleViewVendors} ref={searchFormRef}>
            <Form.Group id="city">
              <Form.Control
                as="select"
                ref={cityRef}
                onChange={() => {
                  setCityCode(cityRef.current.value);
                  if (cityRef.current.value === "null") {
                    searchFormRef.current.reset();
                  }
                }}
              >
                <option value="null">Select City</option>
                <option value="asr">Amritsar</option>
              </Form.Control>
            </Form.Group>

            {cityCode && cityCode !== "null" && (
              <div>
                <Form.Group id="status">
                  <Form.Control as="select" ref={statusRef}>
                    <option value="">Select profile status (optional..)</option>
                    <option value="queued">Queued</option>
                    <option value="review">Under Review</option>
                    <option value="active">Active</option>
                    <option value="rejected">Rejected</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group id="area">
                  <Form.Control
                    type="text"
                    placeholder="city area .."
                    ref={areaRef}
                    minLength="3"
                    maxLength="20"
                  />
                </Form.Group>

                <Form.Group id="category">
                  <Form.Control
                    type="text"
                    placeholder="business category .."
                    ref={categoryRef}
                    minLength="3"
                    maxLength="20"
                  />
                </Form.Group>

                <Form.Group id="timeline">
                  <Form.Control
                    as="select"
                    ref={timelineRef}
                    onChange={() => setTimeline(timelineRef.current.value)}
                  >
                    <option value="">Select timeline (optional..)</option>
                    <option value="request_date">
                      Date of Request raised by vendor
                    </option>
                    <option value="review_date">
                      Date of Review Commencement
                    </option>
                    <option value="verify_date">
                      Date of profile verification complete
                    </option>
                  </Form.Control>
                </Form.Group>

                {timeline && timeline !== "" && (
                  <div className="row">
                    <div className="col">
                      <Form.Group id="start_date">
                        <FormLabel>
                          <strong>From:</strong>
                        </FormLabel>
                        <Form.Control type="date" ref={startDateRef} />
                      </Form.Group>
                    </div>
                    <div className="col">
                      <Form.Group id="end_date">
                        <FormLabel>
                          <strong>To:</strong>
                        </FormLabel>
                        <Form.Control type="date" ref={endDateRef} />
                      </Form.Group>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="row">
              <div className="col">
                <Button
                  disabled={loading || cityCode === "null"}
                  className="w-100 mt-3"
                  type="submit"
                >
                  Search Vendors
                </Button>
              </div>
              <div className="col">
                <Button
                  disabled={loading || cityCode === "null"}
                  className="w-30 mt-3 btn-warning text-white"
                  onClick={() => {
                    searchFormRef.current.reset();
                    cityRef.current.value = cityCode;
                    setTimeline("");
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </div>
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
      {renderFilterCriteria()}
      {renderVendors()}
    </div>
  );
}
