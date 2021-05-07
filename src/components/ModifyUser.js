import React, { useRef, useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useUserDataStore } from "../backend/userDatastore";
import { useUtility } from "../util/Utility";

export default function ModifyUser() {
  const getUserFormRef = useRef();
  const emailRef = useRef();

  const modifyUserFormRef = useRef();
  const usernameRef = useRef();
  const contactRef = useRef();
  const roleRef = useRef();

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [internalUser, setInternalUser] = useState(null);

  const { getUserDataByEmail, modifyUserData } = useUserDataStore();
  const { isPureString, isPureNumber } = useUtility();

  async function handleGetUserDataSubmit(e) {
    console.log("handleGetUserDataSubmit");
    e.preventDefault();

    clearMessageFields();
    setLoading(true);

    try {
      const userData = await getUserDataByEmail(emailRef.current.value);
      console.log(userData);
      getUserFormRef.current.reset();
      setInternalUser(userData);
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  }

  async function handleModifyUserSubmit(e) {
    console.log("handleModifyUserSubmit");
    e.preventDefault();
    clearMessageFields();
    if (validateUserForm()) {
      let modifiedUser = Object.assign({}, internalUser);
      modifiedUser.username = usernameRef.current.value;
      modifiedUser.contact = contactRef.current.value;
      modifiedUser.role = roleRef.current.value;
      modifiedUser.lastModifiedOn = new Date();

      try {
        await modifyUserData(modifiedUser);
        setInternalUser(modifiedUser);
        setMessage("User Updated Successfully !!");
      } catch (error) {
        setError(error.message);
      }
    }
  }

  function validateUserForm() {
    clearMessageFields();
    let isDataModified = false;

    //validate username
    usernameRef.current.value = usernameRef.current.value.trim();
    if (internalUser.username !== usernameRef.current.value) {
      isDataModified = true;
      if (usernameRef.current.value.length < 3) {
        setError("name must be atleast 3 characters long");
        return false;
      }

      if (!isPureString(usernameRef.current.value)) {
        setError("name cannot have number");
        return false;
      }
    }

    //validate contact
    contactRef.current.value = contactRef.current.value.trim();
    if (internalUser.contact !== contactRef.current.value) {
      isDataModified = true;
      if (contactRef.current.value.length < 10) {
        setError("contact must be 10 digits long");
        return false;
      }

      if (!isPureNumber(contactRef.current.value)) {
        setError("contact must only have digits");
        return false;
      }
    }

    //validate role
    if (internalUser.role !== roleRef.current.value) {
      isDataModified = true;
    }

    if (isDataModified) {
      return true;
    } else {
      setError("No Modification detected");
      return false;
    }
  }

  function resetForm() {
    usernameRef.current.value = internalUser.username;
    contactRef.current.value = internalUser.contact;
    roleRef.current.value = internalUser.role;
    clearMessageFields();
  }

  function clearMessageFields() {
    setError("");
    setMessage("");
  }

  const renderGetUserForm = () => {
    return (
      <Card>
        <Card.Body>
          <h3 className="text-center mb-4">Fetch Internal User</h3>
          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}
          <Form onSubmit={handleGetUserDataSubmit} ref={getUserFormRef}>
            <Form.Group id="email">
              <Form.Label>Email Id</Form.Label>
              <Form.Control
                type="email"
                ref={emailRef}
                required
                defaultValue="a@q.com"
              />
            </Form.Group>

            <Button disabled={loading} className="w-100" type="submit">
              Fetch User Details
            </Button>
          </Form>

          <div className="w-100 text-center mt-3">
            <Link to="/">Dashboard</Link>
          </div>
        </Card.Body>
      </Card>
    );
  };

  const renderModifyUserForm = () => {
    return (
      <Card>
        <Card.Body>
          <h3 className="text-center mb-4">Modify User</h3>
          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}
          <Form onSubmit={handleModifyUserSubmit} ref={modifyUserFormRef}>
            <Form.Group id="contact">
              <Form.Group id="username">
                <Form.Label>User Name</Form.Label>
                <Form.Control
                  type="text"
                  ref={usernameRef}
                  minLength="3"
                  maxLength="20"
                  required
                  defaultValue={internalUser.username}
                />
              </Form.Group>

              <Form.Group id="contact">
                <Form.Label>Contact</Form.Label>
                <Form.Control
                  type="text"
                  maxLength="10"
                  minLength="10"
                  ref={contactRef}
                  defaultValue={internalUser.contact}
                />
              </Form.Group>

              <Form.Group id="email">
                <Form.Label>Email Id</Form.Label>
                <Form.Control
                  type="email"
                  ref={emailRef}
                  required
                  readOnly
                  defaultValue={internalUser.email}
                />
              </Form.Group>

              <Form.Group id="uerRole">
                <Form.Label>Assign Role</Form.Label>
                <Form.Control
                  as="select"
                  ref={roleRef}
                  required
                  defaultValue={internalUser.role}
                >
                  <option value="reviewer">Reviewer</option>
                  <option value="admin">Admin</option>
                  <option value="master">Master</option>
                </Form.Control>
              </Form.Group>
            </Form.Group>

            <Button
              disabled={loading}
              className="w-100 btn btn-warning text-white mt-3"
              type="submit"
            >
              Modify
            </Button>

            <Button
              disabled={loading}
              className="w-100 btn btn-danger mt-3"
              onClick={() => alert("you sure")}
            >
              Delete
            </Button>

            <Button
              disabled={loading}
              className="w-100 btn btn-primary mt-3"
              onClick={resetForm}
            >
              Reset
            </Button>
          </Form>

          <div className="w-100 text-center mt-3">
            <Button
              variant="link"
              onClick={() => {
                clearMessageFields();
                setInternalUser(null);
              }}
            >
              Back
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  };

  return (
    <div>{internalUser ? renderModifyUserForm() : renderGetUserForm()}</div>
  );
}
