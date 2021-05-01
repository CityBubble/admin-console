import CreateUser from "./CreateUser";
import { Container } from "react-bootstrap";
import { AuthProvider } from "../context/AuthContext";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import SecureRoute from "../Route/SecureRoute";
import PasswordReset from "./PasswordReset";

function App() {
  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <Router>
          <AuthProvider>
            <Switch>
              <SecureRoute exact path="/" component={Dashboard} />
              <Route path="/login" component={Login} />
              <SecureRoute path="/createUser" component={CreateUser} />
              <Route path="/forgot-password" component={PasswordReset} />
            </Switch>
          </AuthProvider>
        </Router>
      </div>
    </Container>
  );
}

export default App;
