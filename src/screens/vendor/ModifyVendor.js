import React, { useRef, useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useVendorDataStore } from "../../backend/datastore/vendorDatastore";
import VendorDetailCardView from "../../components/vendor/VendorDetailCardView";
import { useUtility } from "../../util/Utility";

export default function ModifyVendor() {
  const getVendorFormRef = useRef();
  const cityRef = useRef();
  const searchFieldRef = useRef();
  const contactRef = useRef();
  const nameRef = useRef();

  const [searchByContact, setSearchByContact] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [vendorProfiles, setVendorProfiles] = useState([]);

  const { getVendorBySearchField, modifyVendorData, deleteVendorData } =
    useVendorDataStore();

  const {
    formatTextCasing,
    formatCaseForCommaSeparatedItems,
    scrollToTop,
    isPureNumber,
    showConfirmDialog,
  } = useUtility();

  async function handleGetVendorDataSubmit(e) {
    console.log("handleGetVendorDataSubmit");
    e.preventDefault();
    if (searchByContact) {
      if (!isPureNumber(contactRef.current.value)) {
        setError("Mobile number can only contain digits");
        setVendorProfiles([]);
        return;
      }
    }

    clearMessageFields();
    setLoading(true);
    setVendorProfiles([]);
    try {
      const searchVal = searchByContact
        ? contactRef.current.value
        : nameRef.current.value;
      const vendors = await getVendorBySearchField(
        cityRef.current.value,
        searchFieldRef.current.value,
        searchVal
      );
      setVendorProfiles(vendors);
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  }

  function clearMessageFields() {
    setError("");
    setMessage("");
  }

  async function modifyVendorProfile(modifiedVendor) {
    console.log("modifyVendorProfileData");
    try {
      await modifyVendorData(cityRef.current.value, modifiedVendor);
      return [true, "Profile Updated Successfully"];
    } catch (error) {
      return [false, error.message];
    }
  }

  async function deleteVendorDoc(uid, name) {
    if (!uid || !name) {
      setError("No vendor to delete");
      return;
    }
    const consent = showConfirmDialog(
      `Do you really want to delete this vendor: "${name}" ?`
    );
    if (!consent) {
      return;
    }

    try {
     // await deleteVendorData(cityRef.current.value, uid);
      removeVendorFromProfileList(uid);
      alert("Vendor deleted successfully");
    } catch (err) {
      setError(err.message);
      scrollToTop();
    }
  }

  function removeVendorFromProfileList(uid) {
    if (vendorProfiles.length === 1) {
      setVendorProfiles([]);
      setSearchByContact(true);
      getVendorFormRef.current.reset();
    } else {
      /* set state with array filter logic
       to listen to setState callback; implement useEffect with
       the state object as part of dependency list */
      setVendorProfiles(vendorProfiles.filter((item) => item.uid !== uid));
    }
  }

  const renderGetVendorProfileForm = () => {
    return (
      <Card className="w-50 bg-dark text-white">
        <Card.Body>
          <h3 className="text-center mb-4">Fetch Vendor Profile</h3>
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

            <Form.Group id="searchField">
              <Form.Label>
                <strong>Search By</strong>
              </Form.Label>
              <Form.Control
                as="select"
                ref={searchFieldRef}
                onChange={() => {
                  setSearchByContact(
                    searchFieldRef.current.value === "contact"
                  );
                  // TODO: remove later
                  nameRef.current.value = nameRef.current.defaultValue;
                  contactRef.current.value = contactRef.current.defaultValue;
                }}
              >
                <option value="contact">Contact</option>
                <option value="name">Name</option>
              </Form.Control>
            </Form.Group>

            <Form.Group
              id="searchVal_contact"
              style={{ display: searchByContact ? "block" : "none" }}
            >
              <Form.Label>
                <strong>Provide Mobile Number</strong>
              </Form.Label>
              <Form.Control
                type="text"
                ref={contactRef}
                minLength="10"
                maxLength="10"
                placeholder="10-digit mobile number"
                defaultValue=""
              />
            </Form.Group>

            <Form.Group
              id="searchVal_name"
              style={{ display: searchByContact ? "none" : "block" }}
            >
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
            <Link to="/vendors">Back</Link>
          </div>
        </Card.Body>
      </Card>
    );
  };

  const renderVendors = () => {
    return (
      <div className="row">
        {vendorProfiles.map((profile) => {
          return (
            <div className="col mt-3" key={profile.uid}>
              <VendorDetailCardView
                key={profile.uid}
                currVendor={profile}
                modifyVendorCallback={modifyVendorProfile}
                formatCasing={formatTextCasing}
                formatCategoryCasing={formatCaseForCommaSeparatedItems}
                isPureNumber={isPureNumber}
                scrollTop={scrollToTop}
                deleteProfileCallback={deleteVendorDoc}
              ></VendorDetailCardView>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      {renderGetVendorProfileForm()}
      {vendorProfiles && renderVendors()}
    </div>
  );
}
