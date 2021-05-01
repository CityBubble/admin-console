import React, { useState } from "react";
import { Button, Card, Alert } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { Link, useHistory } from "react-router-dom";

export default function Dashboard() {
  const { authUser, signOut } = useAuth();
  const [error, setError] = useState("");
  const history = useHistory();

  async function handleLogOut() {
      setError('')
    try {
      await signOut();
      history.push("/login");
    } catch (error) {
      console.log(error.code);
      setError(error.message);
    }
  }

  return (
    <Card>
      <Card.Body>
        <h3 className="text-center mb-4">DashBoard</h3>
        {error && <Alert variant="danger">{error}</Alert>}
        <strong>Doc Id:</strong> {authUser.uid}
        <br />
        <strong>Email:</strong> {authUser.email}
        <br />
        <Link to="/createUser" className="btn btn-primary w-100 mt-3">
          Create Internal User
        </Link>
        <hr />
        <Button className="w-100 btn-danger" onClick={handleLogOut}>
          Log Out
        </Button>
      </Card.Body>
    </Card>
  );
}
