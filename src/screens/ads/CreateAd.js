import React from "react";
import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { useUtility } from "../../util/Utility";
import { useVendorDataStore } from "../../backend/datastore/vendorDatastore";
import { useAdDataStore } from "../../backend/datastore/adDatastore";
import Constants from "../../util/Constants";

export default function CreateaAd() {
  const getVendorFormRef = useRef();
  const cityRef = useRef();
  const nameRef = useRef();

  const newAdFormRef = useRef();
  const taglineRef = useRef();
  const descRef = useRef();
  const endDateRef = useRef();

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [activeVendor, setActiveVendor] = useState(null);
  const [showNewAdForm, setShowNewAdForm] = useState(false);

  const { getVendorBySearchField } = useVendorDataStore();
  const { addNewAd } = useAdDataStore();

  const { formatTextCasing } = useUtility();

  async function handleGetVendorDataSubmit(e) {
    console.log("handleGetVendorDataSubmit");
    e.preventDefault();
    clearMessageFields();
    setLoading(true);
    setActiveVendor(null);
    setShowNewAdForm(false);
    try {
      const searchVal = formatTextCasing(nameRef.current.value);
      const vendors = await getVendorBySearchField(
        cityRef.current.value,
        "name",
        searchVal
      );
      console.log(vendors);
      setActiveVendor(vendors[0]);
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  }

  async function handleCreateAdSubmit(e) {
    console.log("handleCreateAdSubmit");
    e.preventDefault();
    setLoading(true);
    const adObj = constructNewAdObject();
    if (adObj !== null) {
      try {
        await addNewAd(adObj);
        setMessage("Ad created Successfully");
        newAdFormRef.current.reset();
        setShowNewAdForm(false);
      } catch (error) {
        setError(error.message);
        console.log("ERROR: " + error.message);
      }
    }
    setLoading(false);
  }

  function clearMessageFields() {
    setError("");
    setMessage("");
  }

  function constructNewAdObject() {
    clearMessageFields();

    //validate tagline
    taglineRef.current.value = taglineRef.current.value.trim();
    if (taglineRef.current.value.length < Constants.NAME_MIN_LENGTH) {
      setError("tagline must be atleast 3 characters long");
      return null;
    }

    //validate description
    descRef.current.value = descRef.current.value.trim();
    if (descRef.current.value.length < Constants.NAME_MIN_LENGTH) {
      setError("ad description must be atleast 3 characters long");
      return null;
    }

    //validate expiry date
    if (endDateRef.current.value.length === 0) {
      setError("Please select expiry date");
      return null;
    }

    let today = new Date();
    let endDate = new Date(endDateRef.current.value);
    if (endDate.getTime() < today.getTime()) {
      setError("Expiry date cannot be before today");
      return null;
    }

    const adObj = {
      raw: {
        tagline: taglineRef.current.value,
        desc: descRef.current.value,
      },
      timeline: {
        request_date: today,
        expiry_date: endDate,
      },
      ad_status: {
        status: Constants.ADS_INITIAL_VERIFY_STATUS,
      },
      vendor: {
        uid: activeVendor.uid,
        name: activeVendor.name,
        category: activeVendor.category,
        address: activeVendor.address,
      },
    };
    return adObj;
  }

  const renderGetVendorProfileForm = () => {
    return (
      <Card className="w-100 bg-dark text-white">
        <Card.Body>
          <h3 className="text-center mb-4">Fetch Vendor</h3>
          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}
          <Form onSubmit={handleGetVendorDataSubmit} ref={getVendorFormRef}>
            <Form.Group id="city">
              <Form.Label>
                <strong>City</strong>
              </Form.Label>
              <Form.Control as="select" ref={cityRef}>
                <option value="asr">Amritsar</option>
              </Form.Control>
            </Form.Group>

            <Form.Group id="searchVal_name">
              <Form.Label>
                <strong>Provide Exact Name</strong>
              </Form.Label>
              <Form.Control
                type="text"
                ref={nameRef}
                minLength="3"
                maxLength="40"
                defaultValue=""
                placeholder="Business Name .. keep it exact"
              />
            </Form.Group>

            <Button
              disabled={loading}
              className="w-100 mt-3"
              type="submit"
              variant="success"
            >
              Search
            </Button>
          </Form>
          <div className="w-100 text-center mt-3">
            <Link to="/ads">Back</Link>
          </div>
        </Card.Body>
      </Card>
    );
  };

  const renderActiveVendor = () => {
    return (
      <Card style={{ width: "18rem" }}>
        {activeVendor.logoUrl && (
          <Card.Img variant="top" src={activeVendor.logoUrl} />
        )}
        <Card.Body>
          <Card.Title>{activeVendor.name}</Card.Title>
          <Card.Text>Area = {activeVendor.address.area}</Card.Text>
          <Card.Text>Verification status = {activeVendor.status}</Card.Text>
          <Card.Text>
            Subscription status = {activeVendor.subscription.status}
          </Card.Text>
          {!showNewAdForm &&
            activeVendor.subscription &&
            activeVendor.subscription.status === "subscribed" && (
              <Button
                variant="primary"
                onClick={() => {
                  newAdFormRef.current && newAdFormRef.current.reset();
                  clearMessageFields();
                  setShowNewAdForm(true);
                }}
              >
                Create New Ad
              </Button>
            )}
        </Card.Body>
      </Card>
    );
  };

  const renderNewAdForm = () => {
    return (
      <Card className="w-50">
        <Card.Body>
          <h3 className="text-center mb-4">Create New Ad</h3>
          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}
          <Form onSubmit={handleCreateAdSubmit} ref={newAdFormRef}>
            <Form.Group id="tagline">
              <Form.Label>Tag Line</Form.Label>
              <Form.Control
                type="text"
                ref={taglineRef}
                minLength="3"
                maxLength="40"
                required
              />
            </Form.Group>

            <Form.Group id="description">
              <Form.Label>Desciption</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                ref={descRef}
                minLength="3"
                maxLength="200"
                required
              />
            </Form.Group>
            <Form.Group id="end_date">
              <Form.Label>Valid Till:</Form.Label>
              <Form.Control type="date" ref={endDateRef} />
            </Form.Group>

            <Button disabled={loading} className="w-100 mt-3" type="submit">
              Create AD
            </Button>
            <Button
              className="w-100 mt-3"
              variant="info"
              onClick={() => {
                clearMessageFields();
                newAdFormRef.current.reset();
              }}
            >
              Reset
            </Button>
            <Button
              className="w-100 mt-3"
              variant="danger"
              onClick={() => {
                clearMessageFields();
                newAdFormRef.current.reset();
                setShowNewAdForm(false);
              }}
            >
              Cancel
            </Button>
          </Form>
        </Card.Body>
      </Card>
    );
  };

  return (
    <div>
      <div className="row">
        <div className="col"> {renderGetVendorProfileForm()}</div>
        <div className="col"> {activeVendor && renderActiveVendor()} </div>
      </div>
      <div className="col mt-3 w-70">
        {" "}
        {showNewAdForm && renderNewAdForm()}{" "}
      </div>
    </div>
  );
}
