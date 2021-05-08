import CreateUser from "./components/CreateUser";
import { Container } from "react-bootstrap";
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import SecureRoute from "./Route/SecureRoute";
import PasswordReset from "./components/PasswordReset";
import ModifyUser from "./components/ModifyUser";
import VendorActions from "./components/VendorActions";
import InternalUsers from "./components/InternalUsers";
import ViewVendors from "./components/ViewVendors";

function App() {
  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <div className="w-100" style={{ maxWidth: "1000px" }}>
        <Router>
          <AuthProvider>
            <Switch>
              <Route path="/login" component={Login} />
              <Route path="/forgot-password" component={PasswordReset} />
              <SecureRoute exact path="/" component={Dashboard} />
              <SecureRoute path="/internal_users" component={InternalUsers} />
              <SecureRoute path="/createUser" component={CreateUser} />
              <SecureRoute path="/modifyUser" component={ModifyUser} />
              <SecureRoute path="/vendors" component={VendorActions} />
              <SecureRoute path="/view_vendors" component={ViewVendors} />
            </Switch>
          </AuthProvider>
        </Router>
      </div>
    </Container>
  );
}

export default App;
