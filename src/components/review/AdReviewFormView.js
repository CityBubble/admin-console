import React, { Component } from "react";
import { Form, Button, Card, Alert, ListGroup, Image } from "react-bootstrap";
import Constants from "../../util/Constants";
import GalleryView from "../ads/GalleryView";

export default class AdReviewFormView extends Component {
  gallery = [
    "https://homepages.cae.wisc.edu/~ece533/images/pool.png",
    "https://homepages.cae.wisc.edu/~ece533/images/fruits.png",
    "https://homepages.cae.wisc.edu/~ece533/images/peppers.png",
    "https://homepages.cae.wisc.edu/~ece533/images/watch.png",
  ];

  cityBubbleTerm = "This Offer is exclusively available with City Bubble";
  validTillTerm = "Offer valid till: ";
  expiryDateString = null;

  constructor(props) {
    super(props);
    this.setFormRefs();
    this.handleApproveAdSubmit = this.handleApproveAdSubmit.bind(this);
    const expiryDate = this.props.currAd.timeline.expiry_date.toDate();
    this.expiryDateString = this.props.formatDateToInputField(expiryDate);

    this.state = {
      errorMsg: "",
      loading: false,
      adCoverImg: null,
      adCoverPreviewUrl: null,
      originalGallery: this.props.currAd.gallery,
      modifiledGallery: this.props.currAd.gallery,
      removedUrls: [],
      expiryDate: expiryDate.toString().substring(3, 15),
      processTerms: [],
      processedTagline: "",
    };
  }

  setFormRefs = () => {
    this.taglineRef = React.createRef();
    this.descRef = React.createRef();
    this.expiryDateRef = React.createRef();
    this.offerTypeRef = React.createRef();
  };

  async handleApproveAdSubmit(e) {
    console.log("handleApproveAdSubmit");
    e.preventDefault();
    this.setState({ loading: true, errorMsg: "" });
    if (this.validateAdForm()) {
      const approvedAdObj = this.constructApprovedAdObj();
      const [status, msg] = await this.props.approveAdCallback(
        approvedAdObj,
        this.state.removedUrls
      );
      console.log("status = " + status + "  msg= " + msg);
      if (!status) {
        console.log("handling error on approve Ad");
        this.setErrorMsg(msg);
        this.props.scrollTop();
        this.setState({ loading: false });
      }
    } else {
      this.setState({ loading: false });
    }
  }

  validateAdForm = () => {
    console.log("validate ad form");
    this.setState({
      errorMsg: "",
    });

    //validate ad tagline
    this.taglineRef.current.value = this.taglineRef.current.value.trim();
    if (this.taglineRef.current.value.length < Constants.NAME_MIN_LENGTH) {
      this.setErrorMsg("tagline must be atleast 3 characters long");
      return false;
    }

    //validate description
    if (this.state.processTerms.length === 0) {
      this.setErrorMsg("Terms n Conditions is mandatory");
      return false;
    }

    //validate offer type
    if (this.offerTypeRef.current.value === "null") {
      this.setErrorMsg("Please select offer type");
      return false;
    }

    //validate expiry date
    if (this.expiryDateRef.current.value.length === 0) {
      this.setErrorMsg("Please select expiry date");
      return false;
    }

    let today = new Date();
    let endDate = new Date(this.expiryDateRef.current.value);
    endDate.setHours(23, 59, 59);
    if (endDate.getTime() < today.getTime()) {
      this.setErrorMsg("Expiry date cannot be before today");
      return false;
    }

    //validate offer logo
    if (this.state.adCoverImg === null) {
      this.setErrorMsg("Cover Image is Mandatory");
      return false;
    }

    return true;
  };

  constructApprovedAdObj = () => {
    let approvedAdObj = Object.assign({}, this.props.currAd);
    approvedAdObj.processed = {
      tagline: this.taglineRef.current.value,
      terms: this.state.processTerms,
      img: this.state.adCoverImg,
    };
    approvedAdObj.offer_type = this.offerTypeRef.current.value;
    approvedAdObj.timeline.expiry_date = new Date(
      this.expiryDateRef.current.value
    );
    approvedAdObj.gallery = this.state.modifiledGallery;
    return approvedAdObj;
  };

  handleSelectAdCoverImgFile = (e) => {
    e.preventDefault();
    let coverUrl = URL.createObjectURL(e.target.files[0]);
    this.setState({
      adCoverImg: e.target.files[0],
      adCoverPreviewUrl: coverUrl,
    });
  };

  setErrorMsg = (msg) => {
    this.setState({
      errorMsg: msg,
    });
    this.props.scrollTop();
  };

  skipCurrentAdHelper = async (currAd) => {
    //confirmation dialog
    const consent = this.props.userConsent(
      "Are you sure you want to skip this ad for now. It is not recommended.."
    );
    if (consent) {
      const [status, msg] = await this.props.skipCurrentAdCallback(currAd);
      if (!status) {
        this.setErrorMsg(msg);
      }
    }
  };

  handleGalleryModified = (galleryObj) => {
    console.log("modify gallery callback=> ");
    console.log("modified gallery => " + galleryObj.modifiedGallery.length);
    console.log("removed gallery => " + galleryObj.removedUrls.length);
    this.setState({
      modifiledGallery: galleryObj.modifiedGallery,
      removedUrls: galleryObj.removedUrls,
    });
  };

  renderVendorInfo = (vendor) => {
    return (
      <Card className="w-50 m-3 bg-dark">
        <Card.Header as="h5" className="text-center text-white">
          {vendor.name}
        </Card.Header>
        {vendor.logoUrl && (
          <div className="text-center">
            <Card.Img
              className="img-fluid mt-3"
              variant="top"
              src={vendor.logoUrl}
              style={{ width: 300, height: 200 }}
            />
          </div>
        )}

        <hr className="bg-white"></hr>
        <Card.Body className="bg-white">
          <Card.Text>
            Priority: {this.props.getPriorityText(this.props.currAd.priority)}
          </Card.Text>
          <Card.Text>Area: {vendor.address.area}</Card.Text>
          <Card.Text>Category: {vendor.category.join(", ")}</Card.Text>
          <Card.Text>Labels: {vendor.labels.join(", ")}</Card.Text>
          <Card.Text>Contact: {vendor.contact}</Card.Text>
          <Card.Text>Address: {vendor.address.full_address}</Card.Text>
        </Card.Body>
        <hr className="bg-dark"></hr>
      </Card>
    );
  };

  renderEditableAd = (currAd) => {
    return (
      <Card className="w-100 m-3 bg-secondary text-white">
        <Card.Body>
          {this.state.errorMsg && (
            <Alert variant="danger">{this.state.errorMsg}</Alert>
          )}
          <Form
            onSubmit={this.handleApproveAdSubmit}
            ref={this.verifyVendorFormRef}
          >
            <Form.Group id="uid">
              <Form.Label>Ad Id</Form.Label>
              <Form.Control type="text" defaultValue={currAd.uid} readOnly />
            </Form.Group>

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
            <hr></hr>
            <Form.Group id="processed_tagline">
              <Form.Label>Tagline</Form.Label>
              <Form.Control
                type="text"
                ref={this.taglineRef}
                required
                onChange={() => {
                  this.setState({
                    processedTagline: this.taglineRef.current.value,
                  });
                }}
              />
            </Form.Group>

            <Form.Group id="processed_desc">
              <Form.Label>Terms 'n' Conditions</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                ref={this.descRef}
                required
                onChange={() => {
                  let text = this.descRef.current.value.trim();
                  let finalArr = [];
                  if (text.length > 0) {
                    let arr = text.split(";");
                    for (let i = 0; i < arr.length; i++) {
                      if (arr[i].trim().length > 0) {
                        finalArr.push(arr[i].trim());
                      }
                    }
                  }
                  this.setState({
                    processTerms: finalArr,
                  });
                }}
              />
            </Form.Group>

            <Form.Group id="offerType">
              <Form.Label>Offer Type</Form.Label>
              <Form.Control as="select" ref={this.offerTypeRef} required>
                <option value="null">Select Offer Type</option>
                {this.props.offerTypes.map((offer) => {
                  return <option value={offer.value}>{offer.label}</option>;
                })}
              </Form.Control>
            </Form.Group>

            <Form.Group id="expiry_date">
              <Form.Label>Expiry Date:</Form.Label>
              <Form.Control
                type="date"
                ref={this.expiryDateRef}
                defaultValue={this.expiryDateString}
                onChange={() => {
                  this.setState({
                    expiryDate: new Date(this.expiryDateRef.current.value)
                      .toString()
                      .substring(3, 15),
                  });
                }}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Upload Cover Image</Form.Label>
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

            <GalleryView
              gallery={this.state.originalGallery}
              canRemove={true}
              galleryModifiedCallback={this.handleGalleryModified}
            ></GalleryView>
            <hr></hr>
            <div className="row text-center">
              <div className="col">
                <Button
                  disabled={this.state.loading}
                  className="btn-success"
                  type="submit"
                >
                  Approve
                </Button>
              </div>

              <div className="col">
                <Button
                  disabled={this.state.loading}
                  className="btn-danger"
                  onClick={() => this.skipCurrentAdHelper(this.props.currAd)}
                >
                  Review Later
                </Button>
              </div>
            </div>
          </Form>
        </Card.Body>
      </Card>
    );
  };

  renderPreviewAd = () => {
    return (
      <Card className="w-100 m-3 text-center">
        <Card.Header className="text-white bg-success">Preview</Card.Header>
        <Image
          className="d-block w-100"
          src={this.state.adCoverPreviewUrl}
          alt="Offer Image Here"
          style={{ height: 300 }}
        />
        <Card.Header>{this.state.processedTagline}</Card.Header>
        <Card.Header className="bg-dark text-white">
          Terms & Conditions
        </Card.Header>
        <ListGroup variant="flush">
          <ListGroup.Item>{this.cityBubbleTerm}</ListGroup.Item>
          <ListGroup.Item>
            {this.validTillTerm} {this.state.expiryDate}
          </ListGroup.Item>
          {this.state.processTerms.length > 0 &&
            this.state.processTerms.map((term, index) => {
              return <ListGroup.Item key={index}>{term}</ListGroup.Item>;
            })}
        </ListGroup>
        <div className="bg-light">
          <GalleryView gallery={this.state.modifiledGallery}></GalleryView>
        </div>
      </Card>
    );
  };

  render() {
    if (this.props.currAd) {
      return (
        <div>
          {this.renderVendorInfo(this.props.currAd.vendor)}
          <div className="row">
            <div className="col">
              {this.renderEditableAd(this.props.currAd)}
            </div>
            <div className="col">{this.renderPreviewAd()}</div>
          </div>
        </div>
      );
    }
    return "Loading Details ... ";
  }
}
