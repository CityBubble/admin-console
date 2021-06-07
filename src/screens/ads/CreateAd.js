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

  const [vendorProfiles, setVendorProfiles] = useState([]);
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
    setVendorProfiles([]);
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
      setVendorProfiles(vendors);
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
        //TODO: temporary should remove it once REVIEW AD is done
        review_date: today,
        publish_date: today,
      },
      ad_status: {
        status: "active", //Constants.ADS_INITIAL_VERIFY_STATUS,
        //temporary should remove it once REVIEW AD is done
        reviewed_by: {
          uid: "uid",
          name: "name",
          email: "email",
        },
      },
      vendor: {
        uid: activeVendor.uid,
        name: activeVendor.name,
        contact: activeVendor.contact,
        category: activeVendor.category,
        address: activeVendor.address,
      },
      priority: 1, // should be deduced from vendor's subscription plan
      //temporary should remove it once REVIEW AD is done
      processed: {
        tagline: "Processed: " + taglineRef.current.value,
        desc: "Processed: " + descRef.current.value,
        img_url: null,
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

  const renderVendorProfiles = () => {
    return (
      <div className="row">
        {vendorProfiles.map((currProfile, index) => {
          return (
            <Card
              key={index}
              style={{ width: "18rem" }}
              className="col p-1 m-3"
            >
              {currProfile.logoUrl && (
                <Card.Img variant="top" src={currProfile.logoUrl} />
              )}
              <Card.Body>
                <Card.Title>{currProfile.name}</Card.Title>
                <Card.Text>Area = {currProfile.address.area}</Card.Text>
                <Card.Text>
                  Verification status = {currProfile.status}
                </Card.Text>
                <Card.Text>
                  Subscription status = {currProfile.subscription.status}
                </Card.Text>
                {!showNewAdForm &&
                  currProfile.subscription &&
                  currProfile.subscription.status === "subscribed" && (
                    <Button
                      variant="primary"
                      onClick={() => {
                        setActiveVendor(currProfile);
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
        })}
      </div>
    );
  };

  const renderNewAdForm = () => {
    return (
      <Card className="w-50">
        <Card.Body>
          <h3 className="text-center mb-4">
            {activeVendor.name} - {activeVendor.address.area}
          </h3>
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
        <div className="col">{vendorProfiles && renderVendorProfiles()}</div>
      </div>
      <div className="col mt-3 w-70">
        {" "}
        {showNewAdForm && renderNewAdForm()}{" "}
      </div>
    </div>
  );
}
