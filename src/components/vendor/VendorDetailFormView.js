import React, { Component } from "react";
import { Form, Button, Card, Alert, Image } from "react-bootstrap";
import Constants from "../../util/Constants";

export default class VendorDetailFormView extends Component {
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
      currNewLogoImg: null,
      currPreviewNewLogoImgUrl: null,
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
    this.subscriptionStatusRef = React.createRef();
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
          () => {
            this.tempAddrObj = null;
            this.resetForm(false);
          }
        );
      } else {
        console.log("handling error for modify vendor");
        this.setErrorMsg(msg);
        this.resetVendorProfile(false);
      }
      this.props.scrollTop();
    }
    this.setState({ loading: false });
  }

  resetVendorProfile = (resetForm = true) => {
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
          if (resetForm) {
            this.resetForm();
          }
        }
      );
    } else {
      this.resetForm();
    }
  };

  resetForm = (clearMsgs = true) => {
    this.modifyVendorFormRef.current.reset();
    this.subscriptionStatusRef.current.value =
      this.state.vendor.subscription.status;
    this.setState({
      currNewLogoImg: null,
      currPreviewNewLogoImgUrl: null,
    });

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

  selectNewLogoImgFile = (e) => {
    e.preventDefault();
    let logoUrl = URL.createObjectURL(e.target.files[0]);
    this.setState({
      currNewLogoImg: e.target.files[0],
      currPreviewNewLogoImgUrl: logoUrl,
    });
  };

  constructModifiedVendorObj = () => {
    if (this.tempAddrObj === null) {
      this.tempAddrObj = Object.assign({}, this.state.vendor.address);
    }
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
    modifiedVendor.subscription.status =
      this.subscriptionStatusRef.current.value;
    modifiedVendor.timeline.lastModifiedOn = new Date();

    if (this.state.currNewLogoImg) {
      modifiedVendor.newProfileImg = this.state.currNewLogoImg;
    }

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

    //validate subscription status
    if (
      this.state.vendor.subscription.status !==
      this.subscriptionStatusRef.current.value
    ) {
      isDataModified = true;
    }

    //validate new Profile image url
    if (this.state.currNewLogoImg && this.state.currPreviewNewLogoImgUrl) {
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
              <Form.Control
                type="text"
                readOnly
                defaultValue={vendor.profile_status}
              />
            </Form.Group>
            <Form.Group id="subscription_status">
              <Form.Label>Subscription</Form.Label>
              <Form.Control
                as="select"
                ref={this.subscriptionStatusRef}
                required
                defaultValue={vendor.subscription.status}
              >
                <option
                  value={
                    Constants.VENDOR_PROFILE_SUBSCRIPTION_SUBSCRIBED_STATUS
                  }
                >
                  Subscribed
                </option>
                <option
                  value={
                    Constants.VENDOR_PROFILE_SUBSCRIPTION_UNSUBSCRIBED_STATUS
                  }
                >
                  Un-Subscribed
                </option>
                <option
                  value={Constants.VENDOR_PROFILE_SUBSCRIPTION_FREEZE_STATUS}
                >
                  Freeze
                </option>
              </Form.Control>
            </Form.Group>
            <div className="row">
              {vendor.logoUrl && (
                <div className="col">
                  <h5>Profile Logo</h5>
                  <Image
                    src={vendor.logoUrl}
                    rounded
                    style={{ width: 300, height: 200 }}
                  />
                </div>
              )}

              <div className="col">
                <div className="row">
                  <div className="col">
                    <h5>Add New Logo</h5>
                  </div>
                  <div className="col">
                    <Form.Group>
                      <Form.File id="newLogoImg" custom className="mt-3">
                        <Form.File.Input
                          isValid
                          onChange={this.selectNewLogoImgFile}
                          accept="image/*"
                        />
                        <Form.File.Label data-browse="Browse" />
                        <Form.Control.Feedback type="valid">
                          {this.state.currNewLogoImg &&
                            this.state.currNewLogoImg.name}
                        </Form.Control.Feedback>
                      </Form.File>
                    </Form.Group>
                  </div>
                </div>

                {this.state.currPreviewNewLogoImgUrl && (
                  <Image
                    src={this.state.currPreviewNewLogoImgUrl}
                    rounded
                    style={{ width: 300, height: 200 }}
                  />
                )}
              </div>
            </div>

            <Button
              disabled={this.state.loading}
              className="w-100 btn btn-warning text-white mt-3"
              type="submit"
            >
              Modify
            </Button>
            <Button
              disabled={this.state.loading}
              className="w-100 btn btn-danger mt-3"
              onClick={() =>
                this.props.deleteProfileCallback(vendor.uid, vendor.name)
              }
            >
              Delete
            </Button>
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

  render() {
    if (this.state.vendor) {
      return this.renderVendor(this.state.vendor);
    }
    return "Loading Details ... ";
  }
}
