import React, { useRef, useState } from "react";
import { Form, Button, Card, Alert, FormLabel } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAdDataStore } from "../../backend/datastore/adDatastore";
import AdsListView from "../../components/ads/AdListView";
import { useUtility } from "../../util/Utility";
import { useUIUtility } from "../../util/UIUtility";
import AdDetailView from "../../components/ads/AdDetailView";
import Constants from "../../util/Constants";

export default function ViewAds() {
  const searchFormRef = useRef();
  const cityRef = useRef();
  const statusRef = useRef();
  const categoryRef = useRef();
  const areaRef = useRef();
  const priorityRef = useRef();
  const vendorNameRef = useRef();
  const timelineRef = useRef();
  const startDateRef = useRef();
  const endDateRef = useRef();
  const docsLimitRef = useRef();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cityCode, setCityCode] = useState("null");
  const [timeline, setTimeline] = useState("");
  const [ads, setAds] = useState([]);
  const [selectedAd, setSelectedAd] = useState();
  const [searchFilter, setFilter] = useState(null);
  const [lastDoc, setLastDoc] = useState();
  const [hasMore, setMore] = useState(false);

  const { formatTextCasing, scrollToTop } = useUtility();
  const { getStatusTextColor, getPriorityText } = useUIUtility();
  const { getAds } = useAdDataStore();

  function handleViewAds(e) {
    console.log("handle ViewAds");
    e.preventDefault();

    setError("");
    setSelectedAd(null);
    setLoading(true);

    const filterObj = constructFilterCriteria();
    if (filterObj === undefined || filterObj === null) {
      console.log("aborting search request due to error");
      setLoading(false);
      return;
    }
    setAds([]);
    performSearch(filterObj);
    setLoading(false);
  }

  function constructFilterCriteria() {
    let filterObj = {};

    const vendorName = vendorNameRef.current.value.trim();
    if (vendorName.length > 0) {
      filterObj["vendor"] = formatTextCasing(vendorName);
    }

    const priority = priorityRef.current.value.trim();
    if (priority.length > 0) {
      filterObj["priority"] = parseInt(priority);
    }

    const status = statusRef.current.value.trim();
    if (status.length > 0) {
      filterObj["status"] = status;
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

    console.log("AD FILTER OBJ = " + JSON.stringify(filterObj));
    return filterObj;
  }

  async function performSearch(filterObj) {
    console.log("perform ad search");
    try {
      setFilter(filterObj);
      let [list, last] = await getAds(
        cityRef.current.value,
        docsLimitRef.current.value,
        filterObj
      );
      if (list.length > 0) {
        setAds((ads) => [...ads, ...list]);
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
    setSelectedAd(null);
    setAds([]);
  }

  function handleAdClick(clickedAd) {
    console.log("handle ad click");
    if (clickedAd) {
      setSelectedAd(clickedAd);
      scrollToTop();
    } else {
      setSelectedAd(null);
    }
  }

  function renderFilterCriteria() {
    return (
      <Card>
        <Card.Body>
          <h3 className="text-center mb-4">View Ads </h3>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleViewAds} ref={searchFormRef}>
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
                <Form.Group id="vendor">
                  <Form.Control
                    type="text"
                    placeholder="Vendor name .."
                    ref={vendorNameRef}
                    minLength="3"
                    maxLength="20"
                  />
                </Form.Group>

                <Form.Group id="priority">
                  <Form.Control as="select" ref={priorityRef}>
                    <option value="">Select priority</option>
                    <option value={Constants.PRIORITY_ELITE}>
                      {getPriorityText(Constants.PRIORITY_ELITE)}
                    </option>
                    <option value={Constants.PRIORITY_PREMIUM}>
                      {getPriorityText(Constants.PRIORITY_PREMIUM)}
                    </option>
                    <option value={Constants.PRIORITY_STANDARD}>
                      {getPriorityText(Constants.PRIORITY_STANDARD)}
                    </option>
                  </Form.Control>
                </Form.Group>

                <Form.Group id="status">
                  <Form.Control as="select" ref={statusRef}>
                    <option value="">Select status</option>
                    <option value={Constants.ADS_QUEUED_STATUS}>Queued</option>
                    <option value={Constants.ADS_REVIEW_STATUS}>
                      Under Review
                    </option>
                    <option value={Constants.ADS_ACTIVE_STATUS}>Active</option>
                    <option value={Constants.ADS_FREEZE_STATUS}>Freeze</option>
                    <option value={Constants.ADS_EXPIRED_STATUS}>
                      Expired
                    </option>
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
                    placeholder="ad category .."
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
                    <option value="">Select timeline</option>
                    <option value="request_date">
                      Date of Ad request raised by vendor
                    </option>
                    <option value="publish_date">Date of Ad published</option>
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
                  Search Ads
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

          <div className="text-center">
            <Link to="/ads">Back</Link>
          </div>
        </Card.Body>
      </Card>
    );
  }

  function renderMainView() {
    return (
      <div className="row">
        <div className="col">{renderFilterCriteria()}</div>
        <div className="col">
          {selectedAd && (
            <AdDetailView
              currAd={selectedAd}
              getStatusTextColor={getStatusTextColor}
              getPriority={getPriorityText}
            ></AdDetailView>
          )}
        </div>
      </div>
    );
  }
  return (
    <div>
      {renderMainView()}
      <AdsListView
        adsList={ads}
        onAdClicked={handleAdClick}
        getStatusTextColor={getStatusTextColor}
        getPriority={getPriorityText}
      ></AdsListView>
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
