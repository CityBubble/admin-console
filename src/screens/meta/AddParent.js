import React, { useRef, useState, useEffect } from "react";
import { Alert, Button, Card, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useMetaDataStore } from "../../backend/datastore/metaDatastore";
import Constants from "../../util/Constants";
import { useUtility } from "../../util/Utility";
import ParentCategoriesListView from "../../components/meta/ParentCategoriesListView";

export default function AddParent() {
  const formRef = useRef();
  const parentNameRef = useRef();

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [parents, setParents] = useState([]);

  const { addParent, getParentCategories } = useMetaDataStore();
  const {
    isPureString,
    formatTextCasing,
    objectArrayContainsValue,
  } = useUtility();

  useEffect(() => {
    const fetchParentCategories = async () => {
      console.log("fetching parent categories");
      try {
        const allParents = await getParentCategories();
        if (allParents.length > 0) {
          setParents(allParents);
        }
      } catch (err) {
        console.log(err.message);
        alert("error loading parent categories");
      }
    };

    fetchParentCategories();
  }, []);

  async function handleAddParentSubmit(e) {
    console.log("handle add parent submit");
    e.preventDefault();
    setLoading(true);
    if (validateParentForm()) {
      try {
        const parentObj = constructParentObj();
        await addParent(parentObj);
        setParents([...parents, parentObj]);
        setMessage("Parent Category Added Successfully !!");
        formRef.current.reset();
      } catch (error) {
        setMessage("");
        setError(error.message);
      }
    }
    setLoading(false);
  }

  function validateParentForm() {
    clearMessageFields();

    //validate parent category name
    parentNameRef.current.value = parentNameRef.current.value.trim();
    if (parentNameRef.current.value.length < Constants.NAME_MIN_LENGTH) {
      setError("name must be atleast 3 characters long");
      return false;
    }
    if (!isPureString(parentNameRef.current.value)) {
      setError("category must only have characters");
      return false;
    }
    if (
      objectArrayContainsValue(parents, "name", parentNameRef.current.value)
    ) {
      setError("parent category with same name already exists");
      return false;
    }
    return true;
  }

  function clearMessageFields() {
    setError("");
    setMessage("");
  }

  function constructParentObj() {
    let parentObj = {
      name: formatTextCasing(parentNameRef.current.value),
      categories: [],
    };
    return parentObj;
  }

  function renderParentForm() {
    return (
      <Card className="w-50">
        <Card.Body>
          <h3 className="text-center mb-4">Add Parent Category</h3>
          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}
          <Form onSubmit={handleAddParentSubmit} ref={formRef}>
            <Form.Group id="name">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                ref={parentNameRef}
                minLength="3"
                maxLength="20"
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
      {renderParentForm()}
      <hr></hr>
      <ParentCategoriesListView parents={parents}></ParentCategoriesListView>
    </div>
  );
}
