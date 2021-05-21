import React, { Component } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import Constants from "../../util/Constants";

export default class VendorDetailCardView extends Component {
  tempAddrObj = null;

  constructor(props) {
    super(props);
    this.setFormRefs();
    this.handleModifyVendorSubmit = this.handleModifyVendorSubmit.bind(this);
    this.state = {
      errorMsg: "",
      successMsg: "",
      loading: false,
      vendor: this.props.currVendor,
    };
  }

  setFormRefs = () => {
    this.modifyVendorFormRef = React.createRef();
    this.nameRef = React.createRef();
    this.contactRef = React.createRef();
    this.categoryRef = React.createRef();
    this.areaRef = React.createRef();
    this.pincodeRef = React.createRef();
    this.fullAddressRef = React.createRef();
    this.profileStatusRef = React.createRef();
  };

  render() {
    if (this.state.vendor) {
      return this.renderVendor(this.state.vendor);
    }
    return "Loading Details ... ";
  }

  resetVendorProfile = () => {
    if (this.tempAddrObj) {
      this.setState(
        {
          vendor: {
            ...this.state.vendor,
            address: this.tempAddrObj,
          },
        },
        () => {
          // callback invoked on state update since state update is async func
          this.tempAddrObj = null;
          this.resetForm();
        }
      );
    } else {
      this.resetForm();
    }
  };

  resetForm = (clearMsgs = true) => {
    this.modifyVendorFormRef.current.reset();
    this.profileStatusRef.current.value = this.state.vendor.profile_status;
    if (clearMsgs) {
      this.clearMessageFields();
    }
    this.props.scrollTop();
  };

  clearMessageFields = () => {
    this.setState({
      errorMsg: "",
      successMsg: "",
    });
  };

  async handleModifyVendorSubmit(e) {
    console.log("handleModifyVendorSubmit");
    e.preventDefault();
    this.clearMessageFields();
    this.setState({ loading: true });
    if (this.validateVendorForm()) {
      const modifiedVendor = this.constructModifiedVendorObj();
      const [status, msg] = await this.props.modifyVendorCallback(
        modifiedVendor
      );
      if (status) {
        console.log("updating vendor state");
        this.setState(
          {
            successMsg: msg,
            vendor: {
              ...modifiedVendor,
            },
          },
          () => this.resetForm(false)
        );
      } else {
        this.setErrorMsg(msg);
      }
      this.tempAddrObj = null;
      this.props.scrollTop();
    }
    this.setState({ loading: false });
  }

  constructModifiedVendorObj = () => {
    this.tempAddrObj = Object.assign({}, this.state.vendor.address);
    let modifiedVendor = Object.assign({}, this.state.vendor);

    modifiedVendor.name = this.props.formatCasing(this.nameRef.current.value);
    modifiedVendor.contact = this.contactRef.current.value;
    modifiedVendor.category = this.props.formatCategoryCasing(
      this.categoryRef.current.value
    );
    modifiedVendor.address.area = this.props.formatCasing(
      this.areaRef.current.value
    );
    modifiedVendor.address.pincode = this.pincodeRef.current.value;
    modifiedVendor.address.full_address = this.fullAddressRef.current.value;
    modifiedVendor.profile_status = this.profileStatusRef.current.value;
    modifiedVendor.timeline.lastModifiedOn = new Date();
    return modifiedVendor;
  };

  setErrorMsg = (msg) => {
    this.setState({
      errorMsg: msg,
    });
    this.props.scrollTop();
  };

  validateVendorForm = () => {
    this.clearMessageFields();
    let isDataModified = false;

    //validate vendor name
    this.nameRef.current.value = this.nameRef.current.value.trim();
    if (this.state.vendor.name !== this.nameRef.current.value) {
      isDataModified = true;
      if (this.nameRef.current.value.length < Constants.NAME_MIN_LENGTH) {
        this.setErrorMsg("name must be atleast 3 characters long");
        return false;
      }
    }

    //validate contact
    this.contactRef.current.value = this.contactRef.current.value.trim();
    if (this.state.vendor.contact !== this.contactRef.current.value) {
      isDataModified = true;
      if (this.contactRef.current.value.length < Constants.CONTACT_LENGTH) {
        this.setErrorMsg("contact must be 10 digits long");
        return false;
      }
      if (!this.props.isPureNumber(this.contactRef.current.value)) {
        this.setErrorMsg("contact must only have digits");
        return false;
      }
    }
    //validate category
    this.categoryRef.current.value = this.categoryRef.current.value.trim();
    if (
      this.state.vendor.category.join(", ") !== this.categoryRef.current.value
    ) {
      isDataModified = true;
      if (this.categoryRef.current.value.length < Constants.NAME_MIN_LENGTH) {
        this.setErrorMsg("category must be atleast 3 characters long");
        return false;
      }
    }
    //validate fullAddress
    this.fullAddressRef.current.value =
      this.fullAddressRef.current.value.trim();
    if (
      this.state.vendor.address.full_address !==
      this.fullAddressRef.current.value
    ) {
      isDataModified = true;
      if (
        this.fullAddressRef.current.value.length < Constants.NAME_MIN_LENGTH
      ) {
        this.setErrorMsg("address must be atleast 3 characters long");
        return false;
      }
    }
    //validate area
    this.areaRef.current.value = this.areaRef.current.value.trim();
    if (this.state.vendor.address.area !== this.areaRef.current.value) {
      isDataModified = true;
      if (this.areaRef.current.value.length < Constants.NAME_MIN_LENGTH) {
        this.setErrorMsg("area must be atleast 3 characters long");
        return false;
      }
    }
    //validate pincode
    this.pincodeRef.current.value = this.pincodeRef.current.value.trim();
    if (this.state.vendor.address.pincode !== this.pincodeRef.current.value) {
      isDataModified = true;
      if (this.pincodeRef.current.value.length < Constants.PINCODE_LENGTH) {
        this.setErrorMsg("pincode must be 6 digits long");
        return false;
      }

      if (!this.props.isPureNumber(this.pincodeRef.current.value)) {
        this.setErrorMsg("pincode must only have digits");
        return false;
      }
    }

    //validate profile status
    if (
      this.state.vendor.profile_status !== this.profileStatusRef.current.value
    ) {
      isDataModified = true;
    }

    if (isDataModified) {
      return true;
    } else {
      this.setErrorMsg("No Change detected");
      return false;
    }
  };

  renderVendor = (vendor) => {
    return (
      <Card className="w-100 bg-secondary text-white">
        <Card.Body>
          <h3 className="text-center mb-4">{vendor.name}</h3>
          {this.state.errorMsg && (
            <Alert variant="danger">{this.state.errorMsg}</Alert>
          )}
          {this.state.successMsg && (
            <Alert variant="success">{this.state.successMsg}</Alert>
          )}
          <Form
            onSubmit={this.handleModifyVendorSubmit}
            ref={this.modifyVendorFormRef}
          >
            <Form.Group id="uid">
              <Form.Label>Vendor Id</Form.Label>
              <Form.Control type="text" readOnly defaultValue={vendor.uid} />
            </Form.Group>
            <Form.Group id="name">
              <Form.Label>Business Name</Form.Label>
              <Form.Control
                type="text"
                ref={this.nameRef}
                required
                minLength="3"
                maxLength="40"
                defaultValue={vendor.name}
              />
            </Form.Group>
            <Form.Group id="contact">
              <Form.Label>Primary Contact</Form.Label>
              <Form.Control
                type="text"
                maxLength="10"
                minLength="10"
                ref={this.contactRef}
                defaultValue={vendor.contact}
              />
            </Form.Group>
            <Form.Group id="category">
              <Form.Label>Business Category</Form.Label>
              <Form.Control
                type="text"
                ref={this.categoryRef}
                minLength="3"
                maxLength="40"
                required
                defaultValue={vendor.category.join(", ")}
              />
            </Form.Group>
            <Form.Group id="area">
              <Form.Label>Area</Form.Label>
              <Form.Control
                type="text"
                minLength="3"
                maxLength="40"
                ref={this.areaRef}
                required
                defaultValue={vendor.address.area}
              />
            </Form.Group>
            <Form.Group id="pincode">
              <Form.Label>Pin Code</Form.Label>
              <Form.Control
                type="text"
                minLength="6"
                maxLength="6"
                ref={this.pincodeRef}
                required
                defaultValue={vendor.address.pincode}
              />
            </Form.Group>
            <Form.Group id="full_address">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                ref={this.fullAddressRef}
                minLength="3"
                maxLength="100"
                required
                defaultValue={vendor.address.full_address}
              />
            </Form.Group>
            <Form.Group id="verify_status">
              <Form.Label>Verification Status</Form.Label>
              <Form.Control type="text" readOnly defaultValue={vendor.status} />
            </Form.Group>
            <Form.Group id="profile_status">
              <Form.Label>Profile Status</Form.Label>
              <Form.Control
                as="select"
                ref={this.profileStatusRef}
                required
                defaultValue={vendor.profile_status}
              >
                <option value="verification">Under Verification</option>
                <option value="subscribed">Subscribed</option>
                <option value="unsubscribed">Un-Subscribed</option>
                <option value="freeze">Freeze</option>
              </Form.Control>
            </Form.Group>
            <Button
              disabled={this.state.loading}
              className="w-100 btn btn-warning text-white mt-3"
              type="submit"
            >
              Modify
            </Button>
            {/* <Button
              disabled={this.state.loading}
              className="w-100 btn btn-danger mt-3"
              //onClick={deleteUserDoc}
            >
              Delete
            </Button> */}
            <Button
              disabled={this.state.loading}
              className="w-100 btn btn-primary mt-3"
              onClick={this.resetVendorProfile}
            >
              Reset
            </Button>
          </Form>
        </Card.Body>
      </Card>
    );
  };
}
