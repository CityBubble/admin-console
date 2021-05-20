import React, { useRef, useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

export default function PasswordReset() {
  const emailRef = useRef();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  async function handlePasswordReset(e) {
    console.log("handle password reset");
    e.preventDefault();

    try {
      setError("");
      setMessage("");
      setLoading(true);
      await resetPassword(emailRef.current.value);
      setMessage("Check your inbox for further instructions");
    } catch (error) {
      console.log(error.code);
      setMessage("");
      setError(error.message);
      
    }
    setLoading(false);
  }

  return (
    <Card className="w-50">
      <Card.Body>
        <h3 className="text-center mb-4">Password Reset </h3>
        {error && <Alert variant="danger">{error}</Alert>}
        {message && <Alert variant="success">{message}</Alert>}
        <Form onSubmit={handlePasswordReset}>
          <Form.Group id="email">
            <Form.Label>Email Id</Form.Label>
            <Form.Control type="email" ref={emailRef} required />
          </Form.Group>

          <Button
            disabled={loading || message.length > 0}
            className="w-100"
            type="submit"
          >
            Reset Password
          </Button>
        </Form>

        <div className="w-100 text-center mt-3">
          <Link to="/login">Login</Link>
        </div>
      </Card.Body>
    </Card>
  );
}
