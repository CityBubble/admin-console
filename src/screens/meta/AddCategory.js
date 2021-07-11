import React, { useRef, useState, useEffect } from "react";
import { Alert, Button, Card, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useMetaDataStore } from "../../backend/datastore/metaDatastore";
import Constants from "../../util/Constants";
import { useUtility } from "../../util/Utility";
import CategoriesListView from "../../components/meta/CategoriesListView";

export default function AddCategory() {
  const formRef = useRef();
  const categoryNameRef = useRef();
  const keywordsRef = useRef();
  const parentRef = useRef();

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [parents, setParents] = useState([]);
  const [categories, setCategories] = useState([]);

  const {
    getParentCategories,
    getCategories,
    addCategory,
    addCategoryKeywords,
  } = useMetaDataStore();

  const {
    isPureString,
    formatTextCasing,
    objectArrayContainsValue,
    trimCommaSeparatedItemsToArray,
    arraysEqual,
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
    fetchAllCategories();
  }, []);

  async function fetchAllCategories() {
    console.log("fetching all categories");
    try {
      const allCategories = await getCategories();
      setCategories([]);
      if (allCategories.length > 0) {
        setCategories(allCategories);
      }
    } catch (err) {
      console.log(err.message);
      alert("error loading all categories");
    }
  }

  async function handleAddCategorySubmit(e) {
    console.log("handle add category submit");
    e.preventDefault();
    setLoading(true);
    if (validateCategoryForm()) {
      try {
        const categoryObj = constructCategoryObj();
        await addCategory(categoryObj, parents);
        setCategories([...categories, categoryObj]);
        setMessage("Category Added Successfully !!");
        formRef.current.reset();
      } catch (error) {
        setMessage("");
        setError(error.message);
      }
    }
    setLoading(false);
  }

  function validateCategoryForm() {
    clearMessageFields();

    //validate parent Ref
    if (parentRef.current.value === "null") {
      setError("Please select the parent category");
      return false;
    }

    //validate category name
    categoryNameRef.current.value = categoryNameRef.current.value.trim();
    if (categoryNameRef.current.value.length < Constants.NAME_MIN_LENGTH) {
      setError("name must be atleast 3 characters long");
      return false;
    }
    if (!isPureString(categoryNameRef.current.value)) {
      setError("category must only have characters");
      return false;
    }
    if (
      objectArrayContainsValue(
        categories,
        "name",
        categoryNameRef.current.value
      )
    ) {
      setError("category with same name already exists");
      return false;
    }

    return true;
  }

  function clearMessageFields() {
    setError("");
    setMessage("");
  }

  function constructCategoryObj() {
    const categoryName = formatTextCasing(categoryNameRef.current.value);
    let categoryObj = {
      name: categoryName,
      parent: parentRef.current.value,
      keywords: trimCommaSeparatedItemsToArray(
        keywordsRef.current.value.toLowerCase()
      ),
    };

    //find the parent obj with selected name
    let selectedParent = parents.find(
      (parent) => parent.name === parentRef.current.value
    );
    console.log("ONE = " + JSON.stringify(selectedParent));

    //find if this parent already has the category added
    let isDuplicate = selectedParent.categories.some(
      (item) => item === categoryName
    );
    if (isDuplicate) {
      throw new Error("Category already exists within the parent");
    }
    selectedParent.categories.push(categoryName);
    console.log("TWO = " + JSON.stringify(selectedParent));
    console.log("THREE = " + JSON.stringify(parents));

    console.log("FOUR = " + JSON.stringify(categoryObj));
    return categoryObj;
  }

  async function handleAppendKeywordsAction(category, keywords) {
    try {
      const keywordsArr = trimCommaSeparatedItemsToArray(keywords);
      console.log("new arr => " + keywordsArr);
      if (arraysEqual(category.keywords, keywordsArr)) {
        throw new Error("No Change Detected");
      }
      await addCategoryKeywords(category, keywordsArr);
      alert("keywords added succesfully");
    } catch (err) {
      console.log("error appending keywords: " + err.message);
      alert(err.message);
    }
  }

  function renderCategoryForm() {
    return (
      <Card className="w-50">
        <Card.Body>
          <h3 className="text-center mb-4">Add New Category</h3>
          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}
          <Form onSubmit={handleAddCategorySubmit} ref={formRef}>
            <Form.Group id="parent">
              <Form.Label>Parent</Form.Label>
              <Form.Control as="select" ref={parentRef} required>
                <option value="null">Select Parent Category</option>
                {parents.map((parent, index) => (
                  <option value={parent.name} key={index}>
                    {parent.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group id="name">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                ref={categoryNameRef}
                minLength="3"
                maxLength="20"
                required
              />
            </Form.Group>

            <Form.Group id="name">
              <Form.Label>Keywords</Form.Label>
              <Form.Control as="textarea" rows={5} ref={keywordsRef} />
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
      {renderCategoryForm()}
      <hr></hr>
      <CategoriesListView
        categories={categories}
        appendKeywordsCallback={handleAppendKeywordsAction}
        refreshCategoriesCallback={fetchAllCategories}
      ></CategoriesListView>
    </div>
  );
}
