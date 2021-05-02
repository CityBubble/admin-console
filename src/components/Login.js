import React, { useRef, useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { Link, useHistory } from "react-router-dom";

export default function Login() {
  const emailRef = useRef();
  const pwdRef = useRef();

  const { signIn } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  async function handleLogin(e) {
    console.log("handle login submit");
    e.preventDefault();

    try {
      setError("");
      setLoading(true);
      await signIn(emailRef.current.value, pwdRef.current.value);
      console.log("login successfull");
      history.push("/");
    } catch (error) {
      console.log(error.code);
      setError(error.message);
    }
    setLoading(false);
  }

  return (
    <Card>
      <Card.Body>
        <h3 className="text-center mb-4">Login </h3>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleLogin}>
          <Form.Group id="email">
            <Form.Label>Email Id</Form.Label>
            <Form.Control
              type="email"
              ref={emailRef}
              required
              autoComplete="off"
              defaultValue="raghavaneja92@gmail.com"
            />
          </Form.Group>

          <Form.Group id="password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              maxLength="20"
              minLength="5"
              ref={pwdRef}
              required
              autoComplete="off"
              defaultValue="lionheart14"
            />
          </Form.Group>

          <Button disabled={loading} className="w-100" type="submit">
            Sign In
          </Button>
        </Form>

        <div className="w-100 text-center mt-3">
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>
      </Card.Body>
    </Card>
  );
}
