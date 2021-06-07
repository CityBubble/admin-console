import { Container } from "react-bootstrap";
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import SecureRoute from "./Route/SecureRoute";
import Login from "./screens/authenticate/Login";
import PasswordReset from "./screens/authenticate/PasswordReset";
import Dashboard from "./screens/Dashboard";
import InternalUserAction from "./screens/internalUser/InternalUserAction";
import CreateUser from "./screens/internalUser/CreateUser";
import ModifyUser from "./screens/internalUser/ModifyUser";
import VendorActions from "./screens/vendor/VendorActions";
import ViewVendors from "./screens/vendor/ViewVendors";
import CreateVendorProfile from "./screens/vendor/CreateVendorProfile";
import ModifyVendor from "./screens/vendor/ModifyVendor";
import AdsActions from "./screens/ads/AdsActions";
import CreateAd from "./screens/ads/CreateAd";
import ViewAds from "./screens/ads/ViewAds";
import ModifyAd from "./screens/ads/ModifyAd";

function App() {
  return (
    <Container className="mt-3" style={{ minHeight: "100vh" }}>
      <div>
        <Router>
          <AuthProvider>
            <Switch>
              <Route path="/login" component={Login} />
              <Route path="/forgot-password" component={PasswordReset} />
              <SecureRoute exact path="/" component={Dashboard} />

              <SecureRoute
                path="/internal_users"
                component={InternalUserAction}
              />
              <SecureRoute path="/createUser" component={CreateUser} />
              <SecureRoute path="/modifyUser" component={ModifyUser} />

              <SecureRoute path="/vendors" component={VendorActions} />
              <SecureRoute path="/viewVendors" component={ViewVendors} />
              <SecureRoute
                path="/createVendor"
                component={CreateVendorProfile}
              />
              <SecureRoute path="/modifyVendor" component={ModifyVendor} />

              <SecureRoute path="/ads" component={AdsActions} />
              <SecureRoute path="/createAd" component={CreateAd} />
              <SecureRoute path="/viewAds" component={ViewAds} />
              <SecureRoute path="/modifyAd" component={ModifyAd} />
            </Switch>
          </AuthProvider>
        </Router>
      </div>
    </Container>
  );
}

export default App;
