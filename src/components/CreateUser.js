import React, { useRef, useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

export default function CreateUser() {
  const usernameRef = useRef();
  const contactRef = useRef();
  const emailRef = useRef();
  const roleRef = useRef();

  const { signUp } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    console.log("handle submit");
    e.preventDefault();

    try {
      setError("");
      setLoading(true);
      await signUp(
        emailRef.current.value,
        `pwd@${contactRef.current.value}`
      );
    } catch {
      setError("Failed to create user account");
    }
    setLoading(false);
  }

  return (
    <Card>
      <Card.Body>
        <h3 className="text-center mb-4">Create Internal User</h3>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group id="username">
            <Form.Label>User Name</Form.Label>
            <Form.Control type="text" ref={usernameRef} required />
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
              <option value="super-admin">Super-Admin</option>
            </Form.Control>
          </Form.Group>

          <Button disabled={loading} className="w-100" type="submit">
            Create new user
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}
