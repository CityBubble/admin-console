import React, { useRef, useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useDataStore } from "../backend/datastore";

export default function CreateUser() {
  const formRef = useRef();
  const usernameRef = useRef();
  const contactRef = useRef();
  const emailRef = useRef();
  const roleRef = useRef();

  const { signUp } = useAuth();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { generateUser } = useDataStore();

  async function handleCreateUserSubmit(e) {
    console.log("handle submit");
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const { user } = await signUp(
        emailRef.current.value,
        `pwd@${contactRef.current.value}`
      );
      await generateUser(user, {
        username: usernameRef.current.value,
        contact: contactRef.current.value,
        role: roleRef.current.value,
      });
      setMessage("User Created Successfully !!");
      formRef.current.reset();
    } catch (error) {
      setMessage("");
      setError(error.message);
    }
    setLoading(false);
  }

  return (
    <Card>
      <Card.Body>
        <h3 className="text-center mb-4">Create Internal User</h3>
        {error && <Alert variant="danger">{error}</Alert>}
        {message && <Alert variant="success">{message}</Alert>}
        <Form onSubmit={handleCreateUserSubmit} ref={formRef}>
          <Form.Group id="username">
            <Form.Label>User Name</Form.Label>
            <Form.Control type="text" ref={usernameRef} minLength="3" maxLength="20" required />
          </Form.Group>

          <Form.Group id="contact">
            <Form.Label>Contact</Form.Label>
            <Form.Control
              type="text"
              maxLength="10"
              minLength="10"
              ref={contactRef}
              required
            />
          </Form.Group>

          <Form.Group id="email">
            <Form.Label>Email Id</Form.Label>
            <Form.Control type="email" ref={emailRef} required />
          </Form.Group>

          <Form.Group id="uerRole">
            <Form.Label>Assign Role</Form.Label>
            <Form.Control as="select" ref={roleRef} required>
              <option value="reviewer">Reviewer</option>
              <option value="admin">Admin</option>
              <option value="master">Master</option>
            </Form.Control>
          </Form.Group>

          <Button disabled={loading} className="w-100" type="submit">
            Create new user
          </Button>
        </Form>

        <div className="w-100 text-center mt-3">
          <Link to="/">Dashboard</Link>
        </div>
      </Card.Body>
    </Card>
  );
}
