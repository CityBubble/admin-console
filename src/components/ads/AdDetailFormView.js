import React, { Component } from "react";
import {
  Accordion,
  Alert,
  Button,
  ButtonGroup,
  Card,
  Form,
  ListGroup,
} from "react-bootstrap";
import Constants from "../../util/Constants";
import GalleryView from "./GalleryView";

export default class AdDetailFormView extends Component {
  expiryDateString = null;
  originalAdObjHolder = null;
  modifiedTermsArr = [];
  isExpiryDateModified = false;
  adCoverImg = null;
  modifiledGallery = null;
  removedUrls = [];

  constructor(props) {
    super(props);
    this.state = {
      errorMsg: "",
      successMsg: "",
      loading: false,
      ad: this.props.currentAd,
      showEditableForm: false,
      termsPreviewArr: [],
      adCoverPreviewUrl: this.props.currentAd.processed.img_url,
    };
    this.setFormRefs();
    this.handleModifyAdSubmit = this.handleModifyAdSubmit.bind(this);
    this.modifiedTermsArr = this.props.currentAd.processed.terms;
    this.modifiledGallery = this.props.currentAd.gallery;
  }

  setFormRefs = () => {
    this.modifyAdFormRef = React.createRef();
    this.taglineRef = React.createRef();
    this.termsRef = React.createRef();
    this.priorityRef = React.createRef();
    this.expiryDateRef = React.createRef();
    this.offerTypeRef = React.createRef();
    this.statusRef = React.createRef();
  };

  handleGalleryModified = (galleryObj) => {
    this.modifiledGallery = galleryObj.modifiedGallery;
    this.removedUrls = galleryObj.removedUrls;
  };

  handleSelectAdCoverImgFile = (e) => {
    e.preventDefault();
    this.adCoverImg = e.target.files[0];
    let coverUrl = URL.createObjectURL(this.adCoverImg);
    this.setState({
      adCoverPreviewUrl: coverUrl,
    });
  };

  async handleModifyAdSubmit(e) {
    console.log("handleModifyAdSubmit");
    e.preventDefault();
    this.clearMessageFields();
    this.setState({ loading: true });
    if (this.validateAdForm()) {
      const modifiedAd = this.constructModifiedAdObj();
      const [status, msg] = await this.props.modifyAdCallback(
        modifiedAd,
        this.removedUrls
      );
      if (status) {
        console.log("updating ad state");
        this.setState(
          {
            successMsg: msg,
            ad: {
              ...modifiedAd,
            },
            showEditableForm: false,
            termsPreviewArr: [],
          },
          () => {
            console.log("success callback invoked");
            // callback invoked on state update since state update is async func
            this.resetClassState();
          }
        );
      } else {
        console.log("FALSE");
        this.setErrorMsg(msg);
        this.resetAdObj(false);
      }
    }
    this.setState({ loading: false });
  }

  validateAdForm = () => {
    this.clearMessageFields();
    let isDataModified = false;

    //validate tagline name
    this.taglineRef.current.value = this.taglineRef.current.value.trim();
    if (this.state.ad.processed.tagline !== this.taglineRef.current.value) {
      isDataModified = true;
      if (this.taglineRef.current.value.length < Constants.NAME_MIN_LENGTH) {
        this.setErrorMsg("tagline must be atleast 3 characters long");
        return false;
      }
    }

    //validate description
    const termsArr = this.props.extractTermsFromDesc(
      this.termsRef.current.value
    );
    if (!this.props.arraysEqual(this.state.ad.processed.terms, termsArr)) {
      isDataModified = true;
      if (termsArr.length === 0) {
        this.setErrorMsg("Terms & Conditions cannot be empty");
        return false;
      }
      this.modifiedTermsArr = termsArr;
    }

    //validate offer type
    if (this.state.ad.offer_type !== this.offerTypeRef.current.value) {
      isDataModified = true;
    }

    //validate priority
    if (this.state.ad.priority !== parseInt(this.priorityRef.current.value)) {
      const consent = this.props.getConfirmation(
        "It's not advisable to change priority manually.Are you sure ?"
      );
      if (consent) {
        isDataModified = true;
      } else {
        this.setErrorMsg("Aborted prority change");
        return false;
      }
    }

    //validate expiry date
    if (this.expiryDateRef.current.value.length === 0) {
      this.setErrorMsg("Please select expiry date");
      return false;
    }

    // confirm if expiry date is before current expiry date
    let today = new Date();
    today.setHours(23, 59, 59, 0);
    let modifiedExpiryDate = new Date(this.expiryDateRef.current.value);
    modifiedExpiryDate.setHours(23, 59, 59, 0);
    let originalExpiryDate = this.state.ad.timeline.expiry_date.toDate();
    originalExpiryDate.setHours(23, 59, 59, 0);

    if (originalExpiryDate.getTime() !== modifiedExpiryDate.getTime()) {
      console.log("Dates are not equal");
      if (modifiedExpiryDate.getTime() < today.getTime()) {
        this.setErrorMsg("Expiry date cannot be before today");
        return false;
      }

      if (modifiedExpiryDate.getTime() < originalExpiryDate.getTime()) {
        const consent = this.props.getConfirmation(
          "Modified expiry date is before original expiry date.Are you sure ?"
        );
        if (!consent) {
          this.setErrorMsg("Aborted expiry date change");
          return false;
        }
      }
      this.isExpiryDateModified = true;
      isDataModified = true;
    }

    if (this.removedUrls.length > 0 || this.adCoverImg) {
      isDataModified = true;
    }

    if (isDataModified) {
      return true;
    } else {
      this.setErrorMsg("No Change detected");
      return false;
    }
  };

  constructModifiedAdObj = () => {
    this.originalAdObjHolder = {
      processed: Object.assign({}, this.state.ad.processed),
      ad_status: Object.assign({}, this.state.ad.ad_status),
      timeline: Object.assign({}, this.state.ad.timeline),
    };

    let modifiedAd = Object.assign({}, this.state.ad);
    modifiedAd.processed.tagline = this.taglineRef.current.value;
    modifiedAd.offer_type = this.offerTypeRef.current.value;
    modifiedAd.priority = parseInt(this.priorityRef.current.value);
    modifiedAd.timeline.last_modify_date = new Date();

    modifiedAd.ad_status.modified_by = {
      uid: this.props.authUser.uid,
      name: this.props.authUser.username,
      email: this.props.authUser.email,
      action: "profile",
    };

    if (this.modifiedTermsArr.length > 0) {
      modifiedAd.processed.terms = this.modifiedTermsArr;
    }

    if (this.isExpiryDateModified) {
      modifiedAd.timeline.expiry_date = new Date(
        this.expiryDateRef.current.value
      );
    }

    if (this.removedUrls.length > 0) {
      modifiedAd.gallery = this.modifiledGallery;
    }

    if (this.adCoverImg) {
      modifiedAd.processed.img = this.adCoverImg;
    }
    return modifiedAd;
  };

  extractTermsArrFromInputText = () => {
    let text = this.termsRef.current.value.trim();
    let finalArr = [];
    if (text.length > 0) {
      let arr = text.split(";");
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].trim().length > 0) {
          finalArr.push(arr[i].trim());
        }
      }
    }
    this.modifiedTermsArr = finalArr;
    return finalArr;
  };

  resetAdObj = (clearMsgs = true) => {
    console.log("reset ad obj");
    if (this.originalAdObjHolder) {
      console.log("original");
      console.log("holder=> " + JSON.stringify(this.originalAdObjHolder));
      this.setState(
        {
          ad: {
            ...this.state.ad,
            processed: this.originalAdObjHolder.processed,
            ad_status: this.originalAdObjHolder.ad_status,
            timeline: this.originalAdObjHolder.timeline,
          },
        },
        () => {
          // callback invoked on state update since state update is async func
          console.log(
            "state reset form STATE AD" + JSON.stringify(this.state.ad.timeline)
          );
          this.resetForm(clearMsgs);
        }
      );
    } else {
      console.log("else reset form");
      this.resetForm(clearMsgs);
    }
  };

  resetForm = (clearMsgs = true) => {
    this.setState({
      termsPreviewArr: [],
    });
    this.modifyAdFormRef.current.reset();
    if (clearMsgs) {
      this.clearMessageFields();
    }
    this.resetClassState();
  };

  resetClassState = () => {
    console.log("resetClassState");
    this.originalAdObjHolder = null;
    this.modifiedTermsArr = [];
    this.isExpiryDateModified = false;
    this.adCoverImg = null;
    this.modifiledGallery = this.props.currentAd.gallery;
    this.removedUrls = [];

    this.setState({
      adCoverPreviewUrl: this.props.currentAd.processed.img_url,
    });
  };

  clearMessageFields = () => {
    this.setState({
      errorMsg: "",
      successMsg: "",
    });
  };

  setErrorMsg = (msg) => {
    this.setState({
      errorMsg: msg,
    });
    this.props.scrollTop();
  };

  isAdActive = () => {
    return this.state.ad.ad_status.status === Constants.ADS_ACTIVE_STATUS;
  };

  getDateString = (date) => {
    if (!(date instanceof Date)) {
      date = date.toDate();
    }
    return date.toString().substring(0, 24);
  };

  handleAdStatusModifyRequest = (action) => {
    alert(action);
  };

  render() {
    if (this.state.ad) {
      if (this.state.showEditableForm) {
        return this.renderEditableAdForm(this.state.ad);
      } else {
        return this.renderReadOnlyAd(this.state.ad);
      }
    }
    return "Loading Ad Details ... ";
  }

  renderReadOnlyAd = (currAd) => {
    return (
      <Card key={currAd.uid}>
        <Card.Header className="bg-dark text-white text-center">
          {currAd.vendor.name} ({currAd.vendor.address.area})
        </Card.Header>
        {currAd.processed && currAd.processed.img_url && (
          <div className="text-center">
            <Card.Img
              variant="top"
              src={currAd.processed.img_url}
              style={{ width: "auto", height: 350 }}
            />
          </div>
        )}

        {this.state.successMsg && (
          <Alert variant="success">{this.state.successMsg}</Alert>
        )}
        <Accordion>
          {/* Vendor Info */}
          <Card>
            <Accordion.Toggle
              as={Card.Header}
              eventKey="0"
              className="bg-secondary text-white text-center"
            >
              <strong>Vendor</strong>
            </Accordion.Toggle>
            <Accordion.Collapse eventKey="0">
              <Card>
                {currAd.vendor.logoUrl && (
                  <div className="text-center bg-dark p-1">
                    <Card.Img
                      className="img-fluid"
                      variant="top"
                      src={currAd.vendor.logoUrl}
                      style={{ width: 300, height: 200 }}
                    />
                  </div>
                )}
                <Card.Body className="bg-white">
                  <Card.Text>
                    <strong>Id: </strong> {currAd.vendor.uid}
                  </Card.Text>
                  <Card.Text>
                    <strong>Priority:</strong>
                    {this.props.getPriorityText(currAd.priority)}
                  </Card.Text>
                  <Card.Text>
                    <strong>Area: </strong>
                    {currAd.vendor.address.area}
                  </Card.Text>
                  <Card.Text>
                    <strong>Category:</strong>
                    {currAd.vendor.category.join(", ")}
                  </Card.Text>
                  <Card.Text>
                    <strong>Labels: </strong>
                    {currAd.vendor.labels.join(", ")}
                  </Card.Text>
                  <Card.Text>
                    <strong>Contact:</strong> {currAd.vendor.contact}
                  </Card.Text>
                  <Card.Text>
                    <strong>Address:</strong>
                    {currAd.vendor.address.full_address}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Accordion.Collapse>
          </Card>

          {/* OFfer Info */}
          <Card>
            <Accordion.Toggle
              as={Card.Header}
              className="bg-secondary text-white text-center"
              eventKey="1"
            >
              <strong>Offer</strong>
            </Accordion.Toggle>
            <Accordion.Collapse eventKey="1">
              <Card.Body>
                <Card.Text>
                  <span
                    style={{
                      color: this.props.getStatusColor(currAd.ad_status.status),
                    }}
                  >
                    <strong> {currAd.ad_status.status.toUpperCase()}</strong>
                  </span>
                </Card.Text>
                <Card.Text>
                  <strong>Ad Id: </strong> {currAd.uid}
                </Card.Text>
                <Card.Text>
                  <strong>Priority: </strong>
                  {this.props.getPriorityText(currAd.priority)}
                </Card.Text>
                <Card.Text>
                  <strong>Offer Type: </strong>
                  {currAd.offer_type.toUpperCase()}
                </Card.Text>

                <Card.Text>
                  <strong>Tagline: </strong>"{currAd.processed.tagline}"
                </Card.Text>
                <Card.Header className="bg-dark text-white text-center">
                  Terms & Conditions
                </Card.Header>
                <ListGroup variant="flush">
                  {currAd.processed.terms &&
                    currAd.processed.terms.map((term, index) => {
                      return (
                        <ListGroup.Item key={index}>{term}</ListGroup.Item>
                      );
                    })}
                </ListGroup>
              </Card.Body>
            </Accordion.Collapse>
          </Card>

          {/* Statistics  */}
          <Card>
            <Accordion.Toggle
              as={Card.Header}
              className="bg-secondary text-white text-center"
              eventKey="2"
            >
              <strong>Stats</strong>
            </Accordion.Toggle>
            <Accordion.Collapse eventKey="2">
              <Card.Body>
                <Card.Text>
                  <strong>Views: </strong> {currAd.stats.views}
                </Card.Text>
                <Card.Text>
                  <strong>Coupons: </strong>
                  {currAd.stats.claims}
                </Card.Text>
              </Card.Body>
            </Accordion.Collapse>
          </Card>

          {/* Reviewer Info */}
          <Card>
            <Accordion.Toggle
              as={Card.Header}
              className="bg-secondary text-white text-center"
              eventKey="3"
            >
              <strong>Reviewer</strong>
            </Accordion.Toggle>
            <Accordion.Collapse eventKey="3">
              <Card.Body>
                <Card.Text>
                  <strong>User Id: </strong> {currAd.ad_status.reviewer.uid}
                </Card.Text>
                <Card.Text>
                  <strong>Name: </strong>
                  {currAd.ad_status.reviewer.name}
                </Card.Text>
                <Card.Text>
                  <strong>Email: </strong>
                  {currAd.ad_status.reviewer.email}
                </Card.Text>
              </Card.Body>
            </Accordion.Collapse>
          </Card>

          {/* Timeline */}
          <Card>
            <Accordion.Toggle
              as={Card.Header}
              eventKey="4"
              className="bg-secondary text-white text-center"
            >
              <strong>Timeline</strong>
            </Accordion.Toggle>
            <Accordion.Collapse eventKey="4">
              <Card>
                <Card.Body className="bg-white">
                  <Card.Text>
                    <strong>Requested On: </strong>
                    {currAd.timeline.request_date
                      .toDate()
                      .toString()
                      .substring(0, 24)}
                  </Card.Text>
                  <Card.Text>
                    <strong>Reviewed On: </strong>
                    {currAd.timeline.review_date
                      .toDate()
                      .toString()
                      .substring(0, 24)}
                  </Card.Text>
                  <Card.Text>
                    <strong>Published On: </strong>
                    {currAd.timeline.publish_date
                      .toDate()
                      .toString()
                      .substring(0, 24)}
                  </Card.Text>
                  <Card.Text>
                    <strong>Expires On: </strong>
                    {this.getDateString(currAd.timeline.expiry_date)}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Accordion.Collapse>
          </Card>

          {/* Last Modified Info */}
          {currAd.ad_status.modified_by && (
            <Card>
              <Accordion.Toggle
                as={Card.Header}
                className="bg-secondary text-white text-center"
                eventKey="5"
              >
                <strong>Modified</strong>
              </Accordion.Toggle>
              <Accordion.Collapse eventKey="5">
                <Card.Body>
                  <Card.Text>
                    <strong>Last Modified On: </strong>
                    {this.getDateString(currAd.timeline.last_modify_date)}
                  </Card.Text>
                  <Card.Text>
                    <strong>User Id: </strong>
                    {currAd.ad_status.modified_by.uid}
                  </Card.Text>
                  <Card.Text>
                    <strong>Name: </strong>
                    {currAd.ad_status.modified_by.name}
                  </Card.Text>
                  <Card.Text>
                    <strong>Email: </strong>
                    {currAd.ad_status.modified_by.email}
                  </Card.Text>
                  <Card.Text>
                    <strong>Action: </strong>
                    {currAd.ad_status.modified_by.action.toUpperCase()}
                  </Card.Text>
                </Card.Body>
              </Accordion.Collapse>
            </Card>
          )}

          {/* Gallery */}
          <Card>
            <Accordion.Toggle
              as={Card.Header}
              eventKey="6"
              className="bg-secondary text-white text-center"
            >
              <strong>Gallery</strong>
            </Accordion.Toggle>
            <Accordion.Collapse eventKey="6">
              <Card>
                <GalleryView gallery={currAd.gallery}></GalleryView>
              </Card>
            </Accordion.Collapse>
          </Card>
        </Accordion>

        {!this.state.showEditableForm && (
          <ButtonGroup aria-label="ad_status_actions" className="bg-dark">
            {this.isAdActive() && (
              <Button
                variant="primary"
                className="m-3 p-1"
                onClick={() => {
                  this.setState({
                    showEditableForm: true,
                  });
                  let expiryDate = this.state.ad.timeline.expiry_date;
                  if (!(expiryDate instanceof Date)) {
                    expiryDate = expiryDate.toDate();
                  }
                  this.expiryDateString =
                    this.props.formatDateToInputField(expiryDate);
                }}
              >
                Edit
              </Button>
            )}
            <Button
              variant="danger"
              className="m-3 p-1"
              onClick={() => this.handleAdStatusModifyRequest("stop")}
            >
              Stop
            </Button>

            <Button
              variant={this.isAdActive() ? "info" : "success"}
              className="m-3 p-1"
              onClick={() =>
                this.handleAdStatusModifyRequest(
                  this.isAdActive() ? "freeze" : "activate"
                )
              }
            >
              {this.isAdActive() ? "Freeze" : "Activate"}
            </Button>
          </ButtonGroup>
        )}
      </Card>
    );
  };

  renderEditableAdForm = (currAd) => {
    return (
      <Card key={currAd.uid}>
        <Card.Header className="bg-dark text-white text-center">
          {currAd.vendor.name} ({currAd.vendor.address.area})
        </Card.Header>
        {this.state.adCoverPreviewUrl && (
          <div className="text-center">
            <Card.Img
              variant="top"
              src={this.state.adCoverPreviewUrl}
              style={{ width: "auto", height: 350 }}
            />
          </div>
        )}
        <hr></hr>

        <Card.Body>
          {this.state.errorMsg && (
            <Alert variant="danger">{this.state.errorMsg}</Alert>
          )}
          <Form.Group>
            <Form.Label>Replace Cover Image</Form.Label>
            <Form.File id="cover" custom>
              <Form.File.Input
                isValid
                onChange={this.handleSelectAdCoverImgFile}
                accept="image/*"
              />
              <Form.File.Label data-browse="Browse" />
            </Form.File>
          </Form.Group>
          <hr></hr>
          <Form onSubmit={this.handleModifyAdSubmit} ref={this.modifyAdFormRef}>
            <div className="bg-light">
              <Form.Group id="raw_tagline">
                <Form.Label>Raw Tagline</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={currAd.raw.tagline}
                  readOnly
                />
              </Form.Group>

              <Form.Group id="raw_desc">
                <Form.Label>Raw Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  defaultValue={currAd.raw.desc}
                  readOnly
                />
              </Form.Group>
            </div>
            <hr></hr>

            <Form.Group id="tagline">
              <Form.Label>Tag Line:</Form.Label>
              <Form.Control
                type="text"
                ref={this.taglineRef}
                minLength="3"
                maxLength="40"
                defaultValue={currAd.processed.tagline}
                required
              />
            </Form.Group>

            <Form.Group id="terms">
              <Form.Label>Terms & Conditions:</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                ref={this.termsRef}
                minLength="3"
                maxLength="200"
                defaultValue={currAd.processed.terms.join(";\n")}
                onChange={() => {
                  const termsArr = this.props.extractTermsFromDesc(
                    this.termsRef.current.value
                  );
                  this.setState({
                    termsPreviewArr: termsArr,
                  });
                }}
              />
            </Form.Group>

            {this.state.termsPreviewArr.length > 0 && (
              <div>
                <stong>Terms Preview</stong>
                <ListGroup variant="dark">
                  {this.state.termsPreviewArr.map((term, index) => {
                    return (
                      <ListGroup.Item
                        className="bg-dark text-white"
                        key={index}
                      >
                        {term}
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
              </div>
            )}
            <Form.Group id="offerType">
              <Form.Label>Offer Type:</Form.Label>
              <Form.Control
                as="select"
                ref={this.offerTypeRef}
                required
                defaultValue={currAd.offer_type}
              >
                {this.props.offerTypes.map((offer, index) => {
                  return (
                    <option value={offer.value} key={index}>
                      {offer.label}
                    </option>
                  );
                })}
              </Form.Control>
            </Form.Group>

            <Form.Group id="priority">
              <Form.Label>Priority: (Not recommended)</Form.Label>
              <Form.Control
                as="select"
                ref={this.priorityRef}
                required
                defaultValue={currAd.priority}
              >
                <option value={Constants.PRIORITY_ELITE}>
                  {this.props.getPriorityText(Constants.PRIORITY_ELITE)}
                </option>
                <option value={Constants.PRIORITY_PREMIUM}>
                  {this.props.getPriorityText(Constants.PRIORITY_PREMIUM)}
                </option>
                <option value={Constants.PRIORITY_STANDARD}>
                  {this.props.getPriorityText(Constants.PRIORITY_STANDARD)}
                </option>
              </Form.Control>
            </Form.Group>

            <Form.Group id="expiry_date">
              <Form.Label>Expiry Date: (Not recommended)</Form.Label>
              <Form.Control
                type="date"
                ref={this.expiryDateRef}
                defaultValue={this.expiryDateString}
              />
            </Form.Group>

            <GalleryView
              gallery={this.state.ad.gallery}
              canRemove={true}
              galleryModifiedCallback={this.handleGalleryModified}
            ></GalleryView>

            <ButtonGroup aria-label="actions" className="bg-dark w-100">
              <Button
                disabled={this.state.loading}
                className="btn-warning text-white m-3 p-1"
                type="submit"
              >
                Modify
              </Button>
              <Button
                disabled={this.state.loading}
                variant="danger"
                className="text-white m-3 p-1"
                onClick={() => {
                  this.setState({
                    showEditableForm: false,
                  });
                  this.resetAdObj();
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={this.state.loading}
                variant="secondary"
                className="text-white m-3 p-1"
                onClick={() => {
                  this.resetAdObj();
                }}
              >
                Reset
              </Button>
            </ButtonGroup>
          </Form>
        </Card.Body>
      </Card>
    );
  };
}
