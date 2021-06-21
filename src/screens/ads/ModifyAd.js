import React, { useRef, useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAdDataStore } from "../../backend/datastore/adDatastore";
import AdDetailFormView from "../../components/ads/AdDetailFormView";
import { useAuth } from "../../context/AuthContext";
import { useUtility } from "../../util/Utility";
import { useUIUtility } from "../../util/UIUtility";

export default function ModifyAd() {
  const getVendorAdFormRef = useRef();
  const cityRef = useRef();
  const nameRef = useRef();

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [vendorAds, setVendorAds] = useState([]);
  const [activeAd, setActiveAd] = useState(null);

  const { getAdsForModification, modifyAd } = useAdDataStore();
  const { loggedInUser } = useAuth();

  const { formatTextCasing, scrollToTop, showConfirmDialog } = useUtility();
  const { convertArrayToText, getPriorityText } = useUIUtility();

  async function handleGetVendorAdsSubmit(e) {
    console.log("handleGetVendorAdsSubmit");
    e.preventDefault();

    clearMessageFields();
    setLoading(true);
    resetDefaultState();
    try {
      const searchVal = formatTextCasing(nameRef.current.value);
      const ads = await getAdsForModification(cityRef.current.value, searchVal);
      setVendorAds(ads);
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  }

  function clearMessageFields() {
    setError("");
    setMessage("");
  }

  function resetDefaultState() {
    setVendorAds([]);
    setActiveAd(null);
  }

  async function modifySelectedAd(modifiedAd) {
    console.log("modifyAd");
    try {
      //throw new Error("custom error");
      await modifyAd(cityRef.current.value, modifiedAd);
      return [true, "Ad Updated Successfully"];
    } catch (error) {
      return [false, error.message];
    }
  }

  const renderGetVendorAdsForm = () => {
    return (
      <Card className="w-50 bg-dark text-white">
        <Card.Body>
          <h3 className="text-center mb-4">Fetch Vendor Ads</h3>
          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}
          <Form onSubmit={handleGetVendorAdsSubmit} ref={getVendorAdFormRef}>
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
                required
                minLength="3"
                maxLength="40"
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

  const renderAds = () => {
    return (
      <div className="row">
        {vendorAds.map((currAd, index) => {
          return (
            <div key={index} className="col m-3">
              <AdDetailFormView
                currentAd={currAd}
                scrollTop={scrollToTop}
                modifyAdCallback={modifySelectedAd}
                getConfirmation={showConfirmDialog}
                authUser={loggedInUser}
                formatArrToText={convertArrayToText}
                getPriorityText={getPriorityText}
              ></AdDetailFormView>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      {renderGetVendorAdsForm()}
      {vendorAds && renderAds()}
      {activeAd && JSON.stringify(activeAd)}
    </div>
  );
}