import React, { useRef, useState } from "react";
import { Alert, Button, Card, Form } from "react-bootstrap";
import { useMetaDataStore } from "../../backend/datastore/metaDatastore";
import SubscriptionsListView from "../../components/meta/SubscriptionsListView";
import AddSubscriptionForm from "../../components/meta/AddSubscriptionForm";
import { useUtility } from "../../util/Utility";
import { useConfig } from "../../util/Config";

export default function AddVendorSubscription() {
  const cityRef = useRef();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [fetchedSubscriptionsFlag, setFetchedSubscriptionsFlag] = useState(
    false
  );

  const {
    addSubscription,
    getSubscriptions,
    removeSubscription,
  } = useMetaDataStore();
  const {
    showConfirmDialog,
    formatTextCasing,
    objectArrayContainsValue,
    removeObjectFromArr,
  } = useUtility();
  const { getPriorityText, getPriorityArr } = useConfig();

  function clearMessageFields() {
    setError("");
  }

  async function handleGetSubcripitionsForm(e) {
    console.log("handle getcitySubscriptoins submit");
    e.preventDefault();
    clearMessageFields();
    setLoading(true);
    setFetchedSubscriptionsFlag(false);
    try {
      if (cityRef.current.value === "null") {
        throw new Error("City not selected");
      }
      const subscriptionArr = await getSubscriptions(cityRef.current.value);
      setSubscriptions(subscriptionArr);
      if (subscriptionArr.length === 0) {
        setError("No plans found ..");
      }
      setFetchedSubscriptionsFlag(true);
    } catch (error) {
      setError(error.message);
      setFetchedSubscriptionsFlag(false);
    }
    setLoading(false);
  }

  const renderCityForm = () => {
    return (
      <Card className="w-50 bg-dark text-white m-3">
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleGetSubcripitionsForm}>
            <Form.Group id="city">
              <Form.Label>
                <strong>City</strong>
              </Form.Label>
              <Form.Control as="select" ref={cityRef}>
                <option value="null">Select City</option>
                <option value="asr">Amritsar</option>
              </Form.Control>
            </Form.Group>

            <Button
              disabled={loading}
              className="w-100 mt-3"
              type="submit"
              variant="secondary"
            >
              Get Subscriptions
            </Button>
          </Form>
        </Card.Body>
      </Card>
    );
  };

  async function addNewPlan(subscriptionObj) {
    console.log("add new plan");
    if (objectArrayContainsValue(subscriptions, "name", subscriptionObj.name)) {
      return [false, "Subscription with same name exists"];
    }
    try {
      await addSubscription(cityRef.current.value, subscriptionObj);
      setSubscriptions([...subscriptions, subscriptionObj]);
      return [true, "Success"];
    } catch (err) {
      console.log("Error occured while adding subscription");
      return [false, err.message];
    }
  }

  async function removePlan(planName) {
    console.log("remove plan: " + planName);
    const consent = showConfirmDialog(
      `Do you want to remove plan: ${planName} ?`
    );
    if (consent) {
      try {
        await removeSubscription(cityRef.current.value, planName);
        setSubscriptions(removeObjectFromArr(subscriptions, "name", planName));
      } catch (err) {
        console.log("Error occured while removeing subscription");
      }
    }
  }

  return (
    <div>
      {renderCityForm()}
      <hr></hr>
      {fetchedSubscriptionsFlag && (
        <AddSubscriptionForm
          addSubscriptionCallback={addNewPlan}
          getPriorityTextCallback={getPriorityText}
          getPriorityArrCallback={getPriorityArr}
          objectArrayContainsValue={objectArrayContainsValue}
          removeObjectFromArr={removeObjectFromArr}
          formatTextCasing={formatTextCasing}
        />
      )}
      <hr />
      <SubscriptionsListView
        subscriptions={subscriptions}
        removeSubscriptionCallback={removePlan}
      ></SubscriptionsListView>
    </div>
  );
}
