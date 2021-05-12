import CreateUser from "./screens/CreateUser";
import { Container } from "react-bootstrap";
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Login from "./screens/Login";
import Dashboard from "./screens/Dashboard";
import SecureRoute from "./Route/SecureRoute";
import PasswordReset from "./screens/PasswordReset";
import ModifyUser from "./screens/ModifyUser";
import VendorActions from "./screens/VendorActions";
import InternalUsers from "./screens/InternalUsers";
import ViewVendors from "./screens/ViewVendors";

function App() {
  return (
    <Container className="mt-3"
    style={{ minHeight: "100vh" }}>
      <div>
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
