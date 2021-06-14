import React, { useRef, useState, useEffect } from "react";
import { Form, Button, Card, Alert, Image } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useVendorService } from "../../backend/restService/vendorServiceProxy";
import VendorReviewFormView from "../../components/review/VendorReviewFormView";
import { useAuth } from "../../context/AuthContext";
import { useUtility } from "../../util/Utility";

export default function ReviewVendorProfile() {
  const cityRef = useRef();

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [vendorProfile, setVendorProfile] = useState(null);

  const { getVendorProfileForReview, approveProfile } = useVendorService();
  const { loggedInUser } = useAuth();

  const {
    formatTextCasing,
    formatCaseForCommaSeparatedItems,
    scrollToTop,
    isPureNumber,
    showConfirmDialog,
  } = useUtility();

  function clearMessageFields() {
    setError("");
    setMessage("");
  }

  async function handleGetReviewVendorProfileDataSubmit(e) {
    console.log("handleCreateVendorSubmit");
    e.preventDefault();
    setLoading(true);
    clearMessageFields();
    setVendorProfile(null);
    const vendorObj = await getVendorProfileForReview(
      cityRef.current.value,
      loggedInUser
    );
    console.log("HERE=>" + JSON.stringify(vendorObj));
    if (vendorObj) {
      setVendorProfile(vendorObj);
    } else {
      setError("No Vendor profile found");
    }
    setLoading(false);
  }

  const renderGetVendorProfileForm = () => {
    return (
      <Card className="w-50 bg-dark text-white m-3">
        <Card.Body>
          <h3 className="text-center mb-4">Fetch Vendor Profile</h3>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleGetReviewVendorProfileDataSubmit}>
            <Form.Group id="city">
              <Form.Label>
                <strong>City</strong>
              </Form.Label>
              <Form.Control as="select" ref={cityRef}>
                <option value="asr">Amritsar</option>
              </Form.Control>
            </Form.Group>

            <Button
              disabled={loading}
              className="w-100 mt-3"
              type="submit"
              variant="success"
            >
              Get Queued Profile
            </Button>
          </Form>
          <div className="w-100 text-center mt-3">
            <Link to="/review">Back</Link>
          </div>
        </Card.Body>
      </Card>
    );
  };

  async function approveVendorProfile(profile) {
    console.log("approveVendorProfile");
    if (profile) {
      profile.reviewed_by = {
        uid: loggedInUser.uid,
        name: loggedInUser.username,
        email: loggedInUser.email,
      };

      try {
        await approveProfile(profile);
        setVendorProfile(null);
        return [true, "OK"];
      } catch (error) {
        console.log("ERROR -> " + error.message);
        return [false, error.message];
      }
    }
  }

  return (
    <div>
      {renderGetVendorProfileForm()}
      {message && (
        <Alert variant="success" className="m-3">
          {message}
        </Alert>
      )}
      {vendorProfile && (
        <VendorReviewFormView
          currVendor={vendorProfile}
          approveVendorProfileCallback={approveVendorProfile}
          formatCasing={formatTextCasing}
          formatMultiValueCasing={formatCaseForCommaSeparatedItems}
          isPureNumber={isPureNumber}
          scrollTop={scrollToTop}
        ></VendorReviewFormView>
      )}
    </div>
  );
}
