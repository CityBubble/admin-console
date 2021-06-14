import React, { Component } from "react";
import { Form, Button, Card, Alert, Image } from "react-bootstrap";
import Constants from "../../util/Constants";

export default class VendorReviewFormView extends Component {
  tempAddrObj = null;

  constructor(props) {
    super(props);
    this.setFormRefs();
    this.handleApproveVendorSubmit = this.handleApproveVendorSubmit.bind(this);
    this.state = {
      errorMsg: "",
      loading: false,
      vendor: this.props.currVendor,
      currNewLogoImg: null,
      currPreviewNewLogoImgUrl: null,
    };
  }

  setFormRefs = () => {
    this.verifyVendorFormRef = React.createRef();
    this.nameRef = React.createRef();
    this.contactRef = React.createRef();
    this.categoryRef = React.createRef();
    this.labelsRef = React.createRef();
    this.areaRef = React.createRef();
    this.pincodeRef = React.createRef();
    this.fullAddressRef = React.createRef();
  };

  async handleApproveVendorSubmit(e) {
    console.log("handleVerifyVendorSubmit");
    e.preventDefault();
    this.setState({ loading: true, errorMsg: "" });
    if (this.validateVendorForm()) {
      const approvedVendor = this.constructApprovedVendorObj();
      const [status, msg] = await this.props.approveVendorProfileCallback(
        approvedVendor
      );
      console.log("status = " + status + "  msg= " + msg);
      if (status) {
        this.tempAddrObj = null;
      } else {
        console.log("handling error for modify vendor");
        this.setErrorMsg(msg);
      }
      this.props.scrollTop();
    }
    this.setState({ loading: false });
  }

  validateVendorForm = () => {
    console.log("validate vendor form");
    this.setState({
      errorMsg: "",
    });

    //validate vendor name
    this.nameRef.current.value = this.nameRef.current.value.trim();
    if (this.nameRef.current.value.length < Constants.NAME_MIN_LENGTH) {
      this.setErrorMsg("name must be atleast 3 characters long");
      return false;
    }

    //validate contact
    this.contactRef.current.value = this.contactRef.current.value.trim();
    if (this.contactRef.current.value.length < Constants.CONTACT_LENGTH) {
      this.setErrorMsg("contact must be 10 digits long");
      return false;
    }
    if (!this.props.isPureNumber(this.contactRef.current.value)) {
      this.setErrorMsg("contact must only have digits");
      return false;
    }

    //validate category
    this.categoryRef.current.value = this.categoryRef.current.value.trim();
    if (this.categoryRef.current.value.length < Constants.NAME_MIN_LENGTH) {
      this.setErrorMsg("category must be atleast 3 characters long");
      return false;
    }

    //validate labels
    this.labelsRef.current.value = this.labelsRef.current.value.trim();
    if (this.labelsRef.current.value.length < Constants.NAME_MIN_LENGTH) {
      this.setErrorMsg("ensure valid labels as per the profile category");
      return false;
    }

    //validate fullAddress
    this.fullAddressRef.current.value =
      this.fullAddressRef.current.value.trim();
    if (this.fullAddressRef.current.value.length < Constants.NAME_MIN_LENGTH) {
      this.setErrorMsg("address must be atleast 3 characters long");
      return false;
    }

    //validate area
    this.areaRef.current.value = this.areaRef.current.value.trim();
    if (this.areaRef.current.value.length < Constants.NAME_MIN_LENGTH) {
      this.setErrorMsg("area must be atleast 3 characters long");
      return false;
    }

    //validate pincode
    this.pincodeRef.current.value = this.pincodeRef.current.value.trim();
    if (this.pincodeRef.current.value.length < Constants.PINCODE_LENGTH) {
      this.setErrorMsg("pincode must be 6 digits long");
      return false;
    }
    if (!this.props.isPureNumber(this.pincodeRef.current.value)) {
      this.setErrorMsg("pincode must only have digits");
      return false;
    }

    return true;
  };

  constructApprovedVendorObj = () => {
    if (this.tempAddrObj === null) {
      this.tempAddrObj = Object.assign({}, this.state.vendor.address);
    }
    let approvedVendor = Object.assign({}, this.state.vendor);

    approvedVendor.name = this.props.formatCasing(this.nameRef.current.value);
    approvedVendor.contact = this.contactRef.current.value;
    approvedVendor.category = this.props.formatMultiValueCasing(
      this.categoryRef.current.value
    );
    approvedVendor.labels = this.props.formatMultiValueCasing(
      this.labelsRef.current.value
    );
    approvedVendor.address.area = this.props.formatCasing(
      this.areaRef.current.value
    );
    approvedVendor.address.pincode = this.pincodeRef.current.value;
    approvedVendor.address.full_address = this.fullAddressRef.current.value;

    if (this.state.currNewLogoImg) {
      approvedVendor.newProfileImg = this.state.currNewLogoImg;
    }
    return approvedVendor;
  };

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
          console.log("called callback for state 11");
          this.tempAddrObj = null;
          this.resetForm();
        }
      );
    } else {
      this.resetForm();
    }
  };

  resetForm = () => {
    console.log("called reset form 22 11");
    this.verifyVendorFormRef.current.reset();
    this.setState({
      currNewLogoImg: null,
      currPreviewNewLogoImgUrl: null,
      errorMsg: "",
    });
    this.props.scrollTop();
  };

  selectNewLogoImgFile = (e) => {
    e.preventDefault();
    let logoUrl = URL.createObjectURL(e.target.files[0]);
    this.setState({
      currNewLogoImg: e.target.files[0],
      currPreviewNewLogoImgUrl: logoUrl,
    });
  };

  setErrorMsg = (msg) => {
    this.setState({
      errorMsg: msg,
    });
    this.props.scrollTop();
  };

  renderVendor = (vendor) => {
    return (
      <Card className="w-100 bg-secondary text-white">
        <Card.Body>
          <h3 className="text-center mb-4">{vendor.name}</h3>
          {this.state.errorMsg && (
            <Alert variant="danger">{this.state.errorMsg}</Alert>
          )}

          <Form
            onSubmit={this.handleApproveVendorSubmit}
            ref={this.verifyVendorFormRef}
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
            <Form.Group id="labels">
              <Form.Label>Labels</Form.Label>
              <Form.Control
                type="text"
                ref={this.labelsRef}
                minLength="3"
                maxLength="40"
                required
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
              className="w-100 btn btn-success mt-3"
              type="submit"
            >
              Approve
            </Button>

            <Button
              disabled={this.state.loading}
              className="w-100 btn btn-primary mt-3"
              onClick={this.resetVendorProfile}
            >
              Reset
            </Button>
            <Button
              disabled={this.state.loading}
              className="w-100 btn btn-danger mt-3"
            >
              Review Later
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
