import React, { useRef, useState } from "react";
import { Form, Button, Card, Alert, FormLabel } from "react-bootstrap";
import { useVendorDataStore } from "../../backend/datastore/vendorDatastore";
import { Link } from "react-router-dom";
import VendorListView from "../../components/vendor/VendorListView";
import VendorDetailView from "../../components/vendor/VendorDetailView";
import { useUtility } from "../../util/Utility";

export default function ViewVendors() {
  const searchFormRef = useRef();
  const cityRef = useRef();
  const statusRef = useRef();
  const subscriptionStatusRef = useRef();
  const categoryRef = useRef();
  const areaRef = useRef();
  const timelineRef = useRef();
  const startDateRef = useRef();
  const endDateRef = useRef();
  const docsLimitRef = useRef();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState();
  const [cityCode, setCityCode] = useState("null");
  const [timeline, setTimeline] = useState("");
  const [searchFilter, setFilter] = useState(null);
  const [lastDoc, setLastDoc] = useState();
  const [hasMore, setMore] = useState(false);

  const { getVendors } = useVendorDataStore();
  const { formatTextCasing, scrollToTop } = useUtility();

  function constructFilterCriteria() {
    let filterObj = {};
    const status = statusRef.current.value.trim();
    if (status.length > 0) {
      filterObj["status"] = status;
    }
    const subscriptionStatus = subscriptionStatusRef.current.value.trim();
    if (subscriptionStatus.length > 0) {
      filterObj["subscription_status"] = subscriptionStatus;
    }
    const area = areaRef.current.value.trim();
    if (area.length > 2) {
      filterObj["area"] = formatTextCasing(area);
    }
    const category = categoryRef.current.value.trim();
    if (category.length > 2) {
      filterObj["category"] = formatTextCasing(category);
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

  async function onMorePress() {
    console.log("MORE");
    let filterObj = searchFilter;
    if (lastDoc) {
      filterObj["lastDoc"] = lastDoc;
      setLoading(true);
      await performSearch(filterObj);
      setLoading(false);
    }
  }

  function resetFilters() {
    searchFormRef.current.reset();
    setTimeline("");
    setMore(false);
    setError("");
    setSelectedVendor(null);
    setVendors([]);
  }

  function handleViewVendors(e) {
    console.log("handle ViewVendors");
    e.preventDefault();

    setError("");
    setSelectedVendor(null);
    setLoading(true);

    const filterObj = constructFilterCriteria();
    if (filterObj === undefined || filterObj === null) {
      console.log("aborting search request due to error");
      setLoading(false);
      return;
    }
    setVendors([]);
    performSearch(filterObj);
    setLoading(false);
  }

  async function performSearch(filterObj) {
    try {
      setFilter(filterObj);
      let [list, last] = await getVendors(
        cityRef.current.value,
        docsLimitRef.current.value,
        filterObj
      );
      if (list.length > 0) {
        setVendors((vendors) => [...vendors, ...list]);
        setLastDoc(last);
        setMore(list.length === parseInt(docsLimitRef.current.value));
      } else {
        setMore(false);
        setError("No records found ...");
      }
    } catch (err) {
      console.log(err);
      setError(err.message);
    }
  }

  function renderMainView() {
    return (
      <div className="row">
        <div className="col">{renderFilterCriteria()}</div>

        <div className="col">
          {selectedVendor && (
            <VendorDetailView currVendor={selectedVendor}></VendorDetailView>
          )}
        </div>
      </div>
    );
  }

  function renderFilterCriteria() {
    return (
      <Card>
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
                    resetFilters();
                  }
                }}
              >
                <option value="null">Select City</option>
                <option value="asr">Amritsar</option>
              </Form.Control>
            </Form.Group>

            <Form.Group id="limit">
              <FormLabel>
                <strong>Records per Search:</strong>
              </FormLabel>
              <Form.Control as="select" ref={docsLimitRef}>
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </Form.Control>
            </Form.Group>

            {cityCode && cityCode !== "null" && (
              <div>
                <Form.Group id="status">
                  <Form.Control as="select" ref={statusRef}>
                    <option value="">
                      Select verification status (optional..)
                    </option>
                    <option value="queued">Queued</option>
                    <option value="review">Under Review</option>
                    <option value="active">Active</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group id="subscription_status">
                  <Form.Control as="select" ref={subscriptionStatusRef}>
                    <option value="">
                      Select subcription status (optional..)
                    </option>
                    <option value="verification">Under Verification</option>
                    <option value="subscribed">Subscribed</option>
                    <option value="unsubscribed">Un-Subscribed</option>
                    <option value="freeze">Freeze</option>
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
                    {/* <option value="review_date">
                      Date of Review Commencement
                    </option>
                    <option value="verify_date">
                      Date of profile verification complete
                    </option> */}
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
                    resetFilters();
                    cityRef.current.value = cityCode;
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </Form>
          <hr />

          <div className="">
            <Link to="/vendors">Back</Link>
          </div>
        </Card.Body>
      </Card>
    );
  }

  function handleVendorClick(vendor) {
    if (vendor) {
      setSelectedVendor(vendor);
      scrollToTop();
    } else {
      setSelectedVendor(null);
    }
  }

  return (
    <div>
      {renderMainView()}
      <VendorListView
        vendorList={vendors}
        onVendorClicked={handleVendorClick}
      ></VendorListView>
      <div className="row p-3">
        <div className="col">
          <Button
            disabled={hasMore === false}
            variant="dark"
            onClick={onMorePress}
          >
            More
          </Button>
        </div>
      </div>
    </div>
  );
}
