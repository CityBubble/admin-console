import React, { useEffect, useRef, useState } from "react";
import { Alert, Button, Card, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useMetaDataStore } from "../../backend/datastore/metaDatastore";
import TopupPlanListView from "../../components/meta/TopupPlanListView";
import Constants from "../../util/Constants";
import { useUtility } from "../../util/Utility";

export default function AddTopup() {
  const formRef = useRef();
  const planNameRef = useRef();
  const couponsRef = useRef();
  const priceRef = useRef();
  const planPriceRef = useRef();

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);

  const { addTopUpPlan, getTopupPlans } = useMetaDataStore();
  const {
    isPureString,
    formatTextCasing,
    objectArrayContainsValue,
  } = useUtility();

  useEffect(() => {
    const fetchTopupPlans = async () => {
      console.log("fetching topup plans");
      const allPlans = await getTopupPlans();
      if (allPlans.length > 0) {
        setPlans(allPlans);
      }
    };
    fetchTopupPlans();
  }, []);

  async function handleAddPlanSubmit(e) {
    console.log("handle add topup plan submit");
    e.preventDefault();
    setLoading(true);
    if (validatePlanForm()) {
      try {
        const planOBj = constructPlanObj();
        await addTopUpPlan(planOBj);
        setPlans([...plans, planOBj]);
        setMessage("Plan Added Successfully !!");
        formRef.current.reset();
      } catch (error) {
        setMessage("");
        setError(error.message);
      }
    }
    setLoading(false);
    planNameRef.current.focus();
  }

  function validatePlanForm() {
    clearMessageFields();

    //validate plan name
    planNameRef.current.value = planNameRef.current.value.trim();
    if (planNameRef.current.value.length < Constants.NAME_MIN_LENGTH) {
      setError("plan name must be atleast 3 characters long");
      return false;
    }

    if (!isPureString(planNameRef.current.value)) {
      setError("plan name must only have characters");
      return false;
    }

    if (objectArrayContainsValue(plans, "name", planNameRef.current.value)) {
      setError("plan with similar name already exists");
      return false;
    }

    if (objectArrayContainsValue(plans, "coupons", couponsRef.current.value)) {
      setError("plan with similar coupons already exists");
      return false;
    }
    return true;
  }

  function clearMessageFields() {
    setError("");
    setMessage("");
  }

  function constructPlanObj() {
    let planOBj = {
      name: formatTextCasing(planNameRef.current.value),
      coupons: couponsRef.current.value,
      price: planPriceRef.current.value,
    };
    return planOBj;
  }

  function renderPlanForm() {
    return (
      <Card className="w-50">
        <Card.Body>
          <h3 className="text-center mb-4">Add Top-Up Plan</h3>
          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}
          <Form onSubmit={handleAddPlanSubmit} ref={formRef}>
            <Form.Group id="plan">
              <Form.Label>Plan</Form.Label>
              <Form.Control
                type="text"
                ref={planNameRef}
                minLength="3"
                maxLength="20"
                required
              />
            </Form.Group>

            <Form.Group id="coupons">
              <Form.Label>Coupons</Form.Label>
              <Form.Control
                type="number"
                min="1"
                max="50"
                ref={couponsRef}
                required
                defaultValue="1"
                onChange={() => {
                  planPriceRef.current.value =
                    couponsRef.current.value * priceRef.current.value;
                }}
              />
            </Form.Group>

            <Form.Group id="price">
              <Form.Label>
                Per Coupon Price (min= 2/coupon ; max= 10/coupon)
              </Form.Label>
              <Form.Control
                type="number"
                min="2"
                max="10"
                ref={priceRef}
                required
                defaultValue="2"
                onChange={() => {
                  planPriceRef.current.value =
                    couponsRef.current.value * priceRef.current.value;
                }}
              />
            </Form.Group>

            <Form.Group id="tot_price">
              <Form.Label>Plan Price</Form.Label>
              <Form.Control
                type="number"
                ref={planPriceRef}
                required
                readOnly="true"
                defaultValue="2"
              />
            </Form.Group>

            <Button disabled={loading} className="w-100" type="submit">
              Add
            </Button>
          </Form>

          <div className="w-100 text-center mt-3">
            <Link to="/meta">Back</Link>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div>
      {renderPlanForm()}
      <hr></hr>
      <TopupPlanListView plans={plans}></TopupPlanListView>
    </div>
  );
}
