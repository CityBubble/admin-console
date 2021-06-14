import React, { useRef, useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
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

  const {
    getVendorProfileForReview,
    approveProfile,
    skipReviewForCurrentVendor,
  } = useVendorService();
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
    console.log("handleGetReviewVendorProfileDataSubmit");
    e.preventDefault();
    setLoading(true);
    clearMessageFields();
    setVendorProfile(null);
    try {
      const vendorObj = await getVendorProfileForReview(
        cityRef.current.value,
        loggedInUser
      );
      if (vendorObj) {
        setVendorProfile(vendorObj);
      } else {
        setError("No Profile to Review");
      }
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  }

  const renderGetVendorProfileForm = () => {
    return (
      <Card className="w-50 bg-dark text-white m-3">
        <Card.Body>
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
              disabled={loading || vendorProfile}
              className="w-100 mt-3"
              type="submit"
              variant="success"
            >
              Get Queued Profile
            </Button>
          </Form>
          {!vendorProfile && (
            <div className="w-100 text-center mt-3">
              <Link to="/review">Back</Link>
            </div>
          )}
        </Card.Body>
      </Card>
    );
  };

  async function approveVendorProfile(profile) {
    console.log("approveVendorProfile");
    if (profile) {
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

  async function skipCurrentVendorProfile(profile) {
    console.log("skipCurrentVendorProfile -> ");
    if (profile) {
      try {
        await skipReviewForCurrentVendor(profile);
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
          skipCurrentProfileCallback={skipCurrentVendorProfile}
          formatCasing={formatTextCasing}
          formatMultiValueCasing={formatCaseForCommaSeparatedItems}
          isPureNumber={isPureNumber}
          scrollTop={scrollToTop}
          userConsent={showConfirmDialog}
        ></VendorReviewFormView>
      )}
    </div>
  );
}
