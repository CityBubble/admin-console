import React, { Component } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import Constants from "../../util/Constants";

export default class AdDetailFormView extends Component {
  tempProcessedObj = null;
  tempStatusObj = null;

  constructor(props) {
    super(props);
    this.state = {
      errorMsg: "",
      successMsg: "",
      loading: false,
      ad: this.props.currentAd,
      showEditableForm: false,
    };
    this.setFormRefs();
    this.handleModifyAdSubmit = this.handleModifyAdSubmit.bind(this);
  }

  setFormRefs = () => {
    this.modifyAdFormRef = React.createRef();
    this.taglineRef = React.createRef();
    this.descRef = React.createRef();
    this.priorityRef = React.createRef();
    this.statusRef = React.createRef();
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

  async handleModifyAdSubmit(e) {
    console.log("handleModifyAdSubmit");
    e.preventDefault();
    this.clearMessageFields();
    this.setState({ loading: true });
    if (this.validateAdForm()) {
      const modifiedAd = this.constructModifiedAdObj();
      const [status, msg] = await this.props.modifyAdCallback(modifiedAd);
      if (status) {
        console.log("updating ad state");
        this.setState(
          {
            successMsg: msg,
            ad: {
              ...modifiedAd,
            },
            showEditableForm: false,
          },
          () => {
            console.log("success callback invoked");
            // callback invoked on state update since state update is async func
            this.tempProcessedObj = null;
            this.tempStatusObj = null;
          }
        );
      } else {
        this.setErrorMsg(msg);
        this.resetAdObj(false);
      }
    }
    this.setState({ loading: false });
  }

  constructModifiedAdObj = () => {
    this.tempProcessedObj = Object.assign({}, this.state.ad.processed);
    this.tempStatusObj = Object.assign({}, this.state.ad.ad_status);

    let modifiedAd = Object.assign({}, this.state.ad);
    modifiedAd.ad_status.status = this.statusRef.current.value;
    modifiedAd.priority = parseInt(this.priorityRef.current.value);

    modifiedAd.processed.tagline = this.taglineRef.current.value;
    modifiedAd.processed.desc = this.descRef.current.value;
    console.log(JSON.stringify(this.props.authUser));

    modifiedAd.ad_status.modified_by = {
      uid: this.props.authUser.uid,
      name: this.props.authUser.username,
      email: this.props.authUser.email,
      lastModifiedOn: new Date(),
    };
    return modifiedAd;
  };

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
    this.descRef.current.value = this.descRef.current.value.trim();
    if (this.state.ad.processed.desc !== this.descRef.current.value) {
      isDataModified = true;
      if (this.descRef.current.value.length < Constants.NAME_MIN_LENGTH) {
        this.setErrorMsg("ad description must be atleast 3 characters long");
        return false;
      }
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

    //validate status
    if (this.state.ad.ad_status.status !== this.statusRef.current.value) {
      const consent = this.props.getConfirmation(
        "It's not advisable to change the status manually.Are you sure ?"
      );
      if (consent) {
        isDataModified = true;
      } else {
        this.setErrorMsg("Aborted ad status change");
        return false;
      }
    }
    if (isDataModified) {
      return true;
    } else {
      this.setErrorMsg("No Change detected");
      return false;
    }
  };

  resetAdObj = (clearMsgs = true) => {
    if (this.tempProcessedObj) {
      this.setState(
        {
          ad: {
            ...this.state.ad,
            processed: this.tempProcessedObj,
            ad_status: this.tempStatusObj,
          },
        },
        () => {
          // callback invoked on state update since state update is async func
          this.tempProcessedObj = null;
          this.tempStatusObj = null;
          this.resetForm(clearMsgs);
        }
      );
    } else {
      this.resetForm(clearMsgs);
    }
  };

  resetForm = (clearMsgs = true) => {
    this.modifyAdFormRef.current.reset();

    if (clearMsgs) {
      this.clearMessageFields();
    }
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
      <Card key={currAd.uid} style={{ width: "auto" }}>
        {currAd.processed && currAd.processed.img_url && (
          <Card.Img variant="top" src={currAd.processed.img_url} />
        )}
        <Card.Body>
          {this.state.successMsg && (
            <Alert variant="success">{this.state.successMsg}</Alert>
          )}
          <Card.Title>
            {currAd.vendor.name} ({currAd.vendor.address.area})
          </Card.Title>
          <Card.Text>
            Categories = {this.props.formatArrToText(currAd.vendor.category)}
          </Card.Text>
          <Card.Text>
            Labels = {this.props.formatArrToText(currAd.vendor.labels)}
          </Card.Text>
          <Card.Text>Uid = {currAd.uid}</Card.Text>
          <Card.Text>Tagline = {currAd.processed.tagline}</Card.Text>
          <Card.Text>Description = {currAd.processed.desc}</Card.Text>
          <Card.Text>Status = {currAd.ad_status.status}</Card.Text>
          <Card.Text>
            Priority = {this.props.getPriorityText(currAd.priority)}
          </Card.Text>
          <Card.Text>
            Published On =
            {currAd.timeline.publish_date.toDate().toString().substring(0, 24)}
          </Card.Text>
          <Card.Text>
            Expires On =
            {currAd.timeline.expiry_date.toDate().toString().substring(0, 24)}
          </Card.Text>
          {!this.state.showEditableForm && (
            <Button
              variant="primary"
              onClick={() => {
                this.setState({
                  showEditableForm: true,
                });
              }}
            >
              Edit
            </Button>
          )}
        </Card.Body>
      </Card>
    );
  };

  renderEditableAdForm = (currAd) => {
    return (
      <Card key={currAd.uid} style={{ width: "auto" }}>
        {currAd.processed && currAd.processed.img_url && (
          <Card.Img variant="top" src={currAd.processed.img_url} />
        )}
        <Card.Body>
          <Card.Title>
            {currAd.vendor.name} ({currAd.vendor.address.area})
          </Card.Title>
          {this.state.errorMsg && (
            <Alert variant="danger">{this.state.errorMsg}</Alert>
          )}

          <Form onSubmit={this.handleModifyAdSubmit} ref={this.modifyAdFormRef}>
            <Form.Group id="tagline">
              <Form.Label>Tag Line</Form.Label>
              <Form.Control
                type="text"
                ref={this.taglineRef}
                minLength="3"
                maxLength="40"
                defaultValue={currAd.processed.tagline}
                required
              />
            </Form.Group>

            <Form.Group id="description">
              <Form.Label>Desciption</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                ref={this.descRef}
                minLength="3"
                maxLength="200"
                defaultValue={currAd.processed.desc}
                required
              />
            </Form.Group>
            <Form.Group id="priority">
              <Form.Label>Priority</Form.Label>
              <Form.Control
                as="select"
                ref={this.priorityRef}
                required
                defaultValue={currAd.priority}
              >
                <option value="1">High (Elite)</option>
                <option value="2">Medium (Premium)</option>
                <option value="3">Low (Basic)</option>
              </Form.Control>
            </Form.Group>

            <Form.Group id="ad_status">
              <Form.Label>Status</Form.Label>
              <Form.Control
                as="select"
                ref={this.statusRef}
                required
                defaultValue={currAd.ad_status.status}
              >
                <option value="active">Active</option>
                <option value="freeze">Freeze</option>
                <option value="expired">Expired</option>
              </Form.Control>
            </Form.Group>

            <Button
              disabled={this.state.loading}
              className="btn-warning text-white m-2"
              type="submit"
            >
              Modify
            </Button>
            <Button
              disabled={this.state.loading}
              variant="danger"
              className="m-2"
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
              className="m-2"
              onClick={() => {
                this.resetAdObj();
              }}
            >
              Reset
            </Button>
          </Form>
        </Card.Body>
      </Card>
    );
  };
}
