import React, { useRef, useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAdService } from "../../backend/restService/adServiceProxy";
import AdReviewFormView from "../../components/review/AdReviewFormView";
import { useAuth } from "../../context/AuthContext";
import { useUtility } from "../../util/Utility";
import { useUIUtility } from "../../util/UIUtility";

export default function ReviewAd() {
  const cityRef = useRef();

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentAd, setCurrentAd] = useState(null);

  const { getAdForReview, approveAd, skipReviewForCurrentAd } = useAdService();
  const { loggedInUser } = useAuth();

  const {
    scrollToTop,
    showConfirmDialog,
    dateToInputFieldString,
    getOfferTypesArr,
    extractTermsArrFromInputDescription,
  } = useUtility();

  const { getPriorityText } = useUIUtility();

  function clearMessageFields() {
    setError("");
    setMessage("");
  }

  async function handleGetReviewAdDataSubmit(e) {
    console.log("handleGetReviewAdDataSubmit");
    e.preventDefault();
    setLoading(true);
    clearMessageFields();
    setCurrentAd(null);
    try {
      const adObj = await getAdForReview(cityRef.current.value, loggedInUser);
      setCurrentAd(adObj);
      console.log("uid-> " + adObj.uid);
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  }

  const renderGetAdForm = () => {
    return (
      <Card className="w-50 bg-dark text-white m-3">
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleGetReviewAdDataSubmit}>
            <Form.Group id="city">
              <Form.Label>
                <strong>City</strong>
              </Form.Label>
              <Form.Control as="select" ref={cityRef}>
                <option value="asr">Amritsar</option>
              </Form.Control>
            </Form.Group>

            <Button
              disabled={loading || currentAd}
              className="w-100 mt-3"
              type="submit"
              variant="success"
            >
              Get Queued Ad
            </Button>
          </Form>
          {!currentAd && (
            <div className="w-100 text-center mt-3">
              <Link to="/review">Back</Link>
            </div>
          )}
        </Card.Body>
      </Card>
    );
  };

  async function approveCurrentAd(currAd, removedUrls) {
    console.log("approveCurrentAd");
    if (currAd) {
      try {
        await approveAd(currAd, removedUrls);
        setCurrentAd(null);
        return [true, "OK"];
      } catch (error) {
        console.log("ERROR -> " + error.message);
        return [false, error.message];
      }
    }
  }

  async function skipCurrentAd(currAd) {
    console.log("skipCurrentAd -> ");
    if (currAd) {
      try {
        await skipReviewForCurrentAd(currAd);
        setCurrentAd(null);
        return [true, "OK"];
      } catch (error) {
        console.log("ERROR -> " + error.message);
        return [false, error.message];
      }
    }
  }

  return (
    <div>
      {renderGetAdForm()}
      {message && (
        <Alert variant="success" className="m-3">
          {message}
        </Alert>
      )}
      {currentAd && (
        <AdReviewFormView
          currAd={currentAd}
          approveAdCallback={approveCurrentAd}
          skipCurrentAdCallback={skipCurrentAd}
          scrollTop={scrollToTop}
          userConsent={showConfirmDialog}
          formatDateToInputField={dateToInputFieldString}
          offerTypes={getOfferTypesArr()}
          getPriorityText={getPriorityText}
          extractTermsFromDesc={extractTermsArrFromInputDescription}
        ></AdReviewFormView>
      )}
    </div>
  );
}
