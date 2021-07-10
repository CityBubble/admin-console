import React, { useRef, useState, useEffect } from "react";
import { Alert, Button, Card, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useMetaDataStore } from "../../backend/datastore/metaDatastore";
import CitiesListView from "../../components/meta/CitiesListView";
import Constants from "../../util/Constants";
import { useUtility } from "../../util/Utility";

export default function AddCity() {
  const formRef = useRef();
  const cityNameRef = useRef();
  const cityCodeRef = useRef();

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]);

  const { addCity, getCities } = useMetaDataStore();
  const {
    isPureString,
    formatTextCasing,
    objectArrayContainsValue,
  } = useUtility();

  useEffect(() => {
    const fetchCities = async () => {
      console.log("fetching cities");
      const allCities = await getCities();
      if (allCities.length > 0) {
        setCities(allCities);
      }
    };
    fetchCities();
  }, []);

  async function handleAddCitySubmit(e) {
    console.log("handle add city submit");
    e.preventDefault();
    setLoading(true);
    if (validateCityForm()) {
      try {
        const cityObj = constructCityObj();
        await addCity(cityObj);
        setCities([...cities, cityObj]);
        setMessage("City Added Successfully !!");
        formRef.current.reset();
      } catch (error) {
        setMessage("");
        setError(error.message);
      }
    }
    setLoading(false);
  }

  function validateCityForm() {
    clearMessageFields();

    //validate city name
    cityNameRef.current.value = cityNameRef.current.value.trim();
    if (cityNameRef.current.value.length < Constants.NAME_MIN_LENGTH) {
      setError("name must be atleast 3 characters long");
      return false;
    }

    //validate city code
    cityCodeRef.current.value = cityCodeRef.current.value.trim();
    if (cityCodeRef.current.value.length !== Constants.CITY_CODE_LENGHT) {
      setError("city code must be 3 characters only");
      return false;
    }

    if (!isPureString(cityCodeRef.current.value)) {
      setError("code must only have characters");
      return false;
    }

    if (objectArrayContainsValue(cities, "name", cityNameRef.current.value)) {
      setError("City Name already exists");
      return false;
    }
    if (objectArrayContainsValue(cities, "code", cityCodeRef.current.value)) {
      setError("City Code already exists");
      return false;
    }
    return true;
  }

  function clearMessageFields() {
    setError("");
    setMessage("");
  }

  function constructCityObj() {
    let cityObj = {
      name: formatTextCasing(cityNameRef.current.value),
      code: cityCodeRef.current.value.toLowerCase(),
      stats: {
        vendors: 0,
        ads: 0,
        customers: 0,
      },
    };
    return cityObj;
  }

  function renderCityForm() {
    return (
      <Card className="w-50">
        <Card.Body>
          <h3 className="text-center mb-4">Add New City</h3>
          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}
          <Form onSubmit={handleAddCitySubmit} ref={formRef}>
            <Form.Group id="name">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                ref={cityNameRef}
                minLength="3"
                maxLength="20"
                required
              />
            </Form.Group>

            <Form.Group id="code">
              <Form.Label>Code</Form.Label>
              <Form.Control
                type="text"
                minLength="3"
                maxLength="3"
                ref={cityCodeRef}
                required
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
      {renderCityForm()}
      <hr></hr>
      <CitiesListView cities={cities}></CitiesListView>
    </div>
  );
}
