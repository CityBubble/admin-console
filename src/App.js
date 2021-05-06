import CreateUser from "./components/CreateUser";
import { Container } from "react-bootstrap";
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import SecureRoute from "./Route/SecureRoute";
import PasswordReset from "./components/PasswordReset";
import ModifyUser from "./components/ModifyUser";

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
              <SecureRoute path="/modifyUser" component={ModifyUser} />
              <Route path="/forgot-password" component={PasswordReset} />
            </Switch>
          </AuthProvider>
        </Router>
      </div>
    </Container>
  );
}

export default App;
