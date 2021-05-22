import React, { useRef, useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useVendorDataStore } from "../../backend/datastore/vendorDatastore";
import Constants from "../../util/Constants";
import { useUtility } from "../../util/Utility";

export default function CreateVendorProfile() {
  const formRef = useRef();
  const vendorNameRef = useRef();
  const contactRef = useRef();
  const categoryRef = useRef();
  const fullAddressRef = useRef();
  const areaRef = useRef();
  const pincodeRef = useRef();
  const cityRef = useRef();

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { addNewVendorProfile } = useVendorDataStore();
  const {
    isPureNumber,
    showConfirmDialog,
    formatTextCasing,
    formatCaseForCommaSeparatedItems,
  } = useUtility();

  function validateVendorForm() {
    clearMessageFields();

    //validate username
    vendorNameRef.current.value = vendorNameRef.current.value.trim();
    if (vendorNameRef.current.value.length < Constants.NAME_MIN_LENGTH) {
      setError("name must be atleast 3 characters long");
      return false;
    }

    //validate contact
    contactRef.current.value = contactRef.current.value.trim();
    if (contactRef.current.value.length < Constants.CONTACT_LENGTH) {
      setError("contact must be 10 digits long");
      return false;
    }
    if (!isPureNumber(contactRef.current.value)) {
      setError("contact must only have digits");
      return false;
    }

    //validate category
    categoryRef.current.value = categoryRef.current.value.trim();
    if (categoryRef.current.value.length < Constants.NAME_MIN_LENGTH) {
      setError("category must be atleast 3 characters long");
      return false;
    }

    //validate fullAddress
    fullAddressRef.current.value = fullAddressRef.current.value.trim();
    if (fullAddressRef.current.value.length < Constants.NAME_MIN_LENGTH) {
      setError("address must be atleast 3 characters long");
      return false;
    }

    //validate area
    areaRef.current.value = areaRef.current.value.trim();
    if (areaRef.current.value.length < Constants.NAME_MIN_LENGTH) {
      setError("area must be atleast 3 characters long");
      return false;
    }

    //validate pincode
    pincodeRef.current.value = pincodeRef.current.value.trim();
    if (pincodeRef.current.value.length < Constants.PINCODE_LENGTH) {
      setError("pincode must be 6 digits long");
      return false;
    }
    if (!isPureNumber(pincodeRef.current.value)) {
      setError("pincode must only have digits");
      return false;
    }
    return true;
  }

  function clearMessageFields() {
    setError("");
    setMessage("");
  }

  async function handleCreateVendorSubmit(e) {
    console.log("handle handleCreateVendorSubmit");
    e.preventDefault();
    setLoading(true);

    if (validateVendorForm()) {
      try {
        const cityVals = cityRef.current.value.split(",");
        const categories = formatCaseForCommaSeparatedItems(categoryRef.current.value);

        const vendorObj = {
          name: formatTextCasing(vendorNameRef.current.value),
          contact: contactRef.current.value,
          category: categories,
          address: {
            full_address: fullAddressRef.current.value,
            area: formatTextCasing(areaRef.current.value),
            pincode: pincodeRef.current.value,
            city: {
              code: cityVals[0],
              name: cityVals[1],
            },
          },
          profile_status: Constants.VENDOR_PROFILE_INITIAL_PROFILE_STATUS,
          status: Constants.VENDOR_PROFILE_INITIAL_VERIFY_STATUS,
          timeline: {
            request_date: new Date(),
          },
        };
        const [hasOldVendor, vendorName] = await addNewVendorProfile(
          vendorObj,
          true
        );
        if (hasOldVendor) {
          const consent = showConfirmDialog(
            `A vendor [${vendorName}] already exists in the records for the same contact. Do you want to proceed ?`
          );
          if (!consent) {
            alert("aborting request...");
            clearMessageFields();
            setLoading(false);
            return;
          }
          await addNewVendorProfile(vendorObj, false);
        }
        setMessage(
          "Vendor Profile Created Successfully and Available for final review"
        );
        formRef.current.reset();
      } catch (error) {
        setMessage("");
        setError(error.message);
      }
    }
    console.log("set loading false");
    setLoading(false);
  }

  return (
    <Card className="w-50">
      <Card.Body>
        <h3 className="text-center mb-4">Create Vendor Profile</h3>
        {error && <Alert variant="danger">{error}</Alert>}
        {message && <Alert variant="success">{message}</Alert>}
        <Form onSubmit={handleCreateVendorSubmit} ref={formRef}>
          <Form.Group id="name">
            <Form.Label>Business Name</Form.Label>
            <Form.Control
              type="text"
              ref={vendorNameRef}
              minLength="3"
              maxLength="40"
              required
            />
          </Form.Group>

          <Form.Group id="contact">
            <Form.Label>Primary Contact</Form.Label>
            <Form.Control
              type="text"
              maxLength="10"
              minLength="10"
              ref={contactRef}
              required
            />
          </Form.Group>

          <Form.Group id="category">
            <Form.Label>Business Category</Form.Label>
            <Form.Control
              type="text"
              ref={categoryRef}
              minLength="3"
              maxLength="40"
              required
            />
          </Form.Group>

          <Form.Group id="full_address">
            <Form.Label>Address</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              ref={fullAddressRef}
              minLength="3"
              maxLength="100"
              required
            />
          </Form.Group>

          <Form.Group id="area">
            <Form.Label>Area</Form.Label>
            <Form.Control
              type="text"
              minLength="3"
              maxLength="40"
              ref={areaRef}
              required
            />
          </Form.Group>

          <Form.Group id="pincode">
            <Form.Label>Pin Code</Form.Label>
            <Form.Control
              type="text"
              minLength="6"
              maxLength="6"
              ref={pincodeRef}
              required
            />
          </Form.Group>

          <Form.Group id="city">
            <Form.Label>City</Form.Label>
            <Form.Control as="select" ref={cityRef} required>
              <option value="asr,Amritsar">Amritsar</option>
            </Form.Control>
          </Form.Group>

          <Button disabled={loading} className="w-100" type="submit">
            Create Profile
          </Button>
        </Form>

        <div className="w-100 text-center mt-3">
          <Link to="/vendors">Back</Link>
        </div>
      </Card.Body>
    </Card>
  );
}