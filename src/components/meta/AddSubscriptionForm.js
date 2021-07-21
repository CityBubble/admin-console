import React, { Component } from "react";
import { Alert, Button, CardDeck, Card, Form , CardColumns} from "react-bootstrap";
import Constants from "../../util/Constants";

export default class AddSubscriptionForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errorMsg: "",
      successMsg: "",
      loading: false,
      showAddPlanFormFlag: false,
      showDurationFormFlag: false,
      durations: [],
    };
    this.setFormRefs();
  }

  setFormRefs = () => {
    this.planRef = React.createRef();
    this.priorityRef = React.createRef();
    this.galleryRef = React.createRef();

    this.durationRef = React.createRef();
    this.unitsRef = React.createRef();
    this.originalPriceRef = React.createRef();
    this.comboPriceRef = React.createRef();
  };

  handleAddSubscriptionSubmit = async (e) => {
    console.log("handleAddSubscriptionSubmit");
    e.preventDefault();
    this.clearMessageFields();
    this.setState({ loading: true });
    if (this.validateSubscriptionForm()) {
      const subscriptionObj = this.constructSubscriptionObj();
      const [status, msg] = await this.props.addSubscriptionCallback(
        subscriptionObj
      );
      if (status) {
        console.log("updating ad state");
        this.setState({
          successMsg: msg,
          errorMsg: "",
          showAddPlanFormFlag: false,
          durations: [],
        });
      } else {
        console.log("FALSE");
        this.setErrorMsg(msg);
      }
    }
    this.setState({ loading: false });
  };

  validateSubscriptionForm = () => {
    this.clearMessageFields();
    this.planRef.current.value = this.planRef.current.value.trim();
    if (this.planRef.current.value.length < Constants.NAME_MIN_LENGTH) {
      this.setErrorMsg("Plan Name must be atleast 3 charaters long");
      return false;
    }
    if (this.state.durations.length === 0) {
      this.setErrorMsg("Plan must have atleast 1 duration added");
      return false;
    }
    return true;
  };

  constructSubscriptionObj = () => {
    const subscriptionObj = {
      name: this.props.formatTextCasing(this.planRef.current.value),
      priority: parseInt(this.priorityRef.current.value),
      gallery: parseInt(this.galleryRef.current.value),
      durations: this.state.durations,
    };
    console.log("SUBSCRIPTION: " + JSON.stringify(subscriptionObj));
    return subscriptionObj;
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
  };

  handleAddDurationSubmit = async (e) => {
    console.log("handleAddDurationSubmit");
    e.preventDefault();
    let duration = parseInt(this.durationRef.current.value);
    if (
      this.props.objectArrayContainsValue(
        this.state.durations,
        "duration",
        duration,
        true
      )
    ) {
      alert("Same duration already exists.");
    } else {
      let durationObj = {
        duration: duration,
        unit: this.unitsRef.current.value,
        original_price: parseInt(this.originalPriceRef.current.value),
        combo_price: parseInt(this.comboPriceRef.current.value),
      };
      console.log("duration=> " + JSON.stringify(durationObj));
      this.setState({
        durations: [...this.state.durations, durationObj],
        showDurationFormFlag: false,
      });
    }
  };

  removeDurationObjFromArr = (duration) => {
    console.log("removing duration: " + duration);
    this.setState({
      durations: this.props.removeObjectFromArr(
        this.state.durations,
        "duration",
        duration
      ),
    });
  };

  renderAddNewSubscriptionForm = () => {
    return (
      <CardDeck>
        {/* subscription details */}
        <Card className="w-50 bg-dark text-white m-3">
          <Card.Header className="text-center">
            <Button
              onClick={() =>
                this.setState({
                  showAddPlanFormFlag: true,
                })
              }
            >
              Add New Plan
            </Button>
          </Card.Header>
          {this.state.showAddPlanFormFlag && (
            <Card.Body>
              {this.state.errorMsg && (
                <Alert variant="danger">{this.state.errorMsg}</Alert>
              )}
              <Form onSubmit={this.handleAddSubscriptionSubmit}>
                <Form.Group id="plan">
                  <Form.Label>
                    <strong>Plan Name</strong>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    ref={this.planRef}
                    minLength="3"
                    maxLength="20"
                    required
                  />
                </Form.Group>

                <Form.Group id="priority">
                  <Form.Label>
                    <strong>Priority</strong>
                  </Form.Label>
                  <Form.Control as="select" ref={this.priorityRef}>
                    {this.props
                      .getPriorityArrCallback()
                      .map((priority, index) => {
                        return (
                          <option value={priority} key={index}>
                            {this.props.getPriorityTextCallback(priority)}
                          </option>
                        );
                      })}
                  </Form.Control>
                </Form.Group>

                <Form.Group id="gallery">
                  <Form.Label>
                    <strong>Max Allowed Gallery</strong>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    ref={this.galleryRef}
                    min="1"
                    max="10"
                    required
                  />
                </Form.Group>
                <hr />
                <Button
                  variant="link"
                  onClick={() => {
                    this.setState({ showDurationFormFlag: true });
                  }}
                >
                  Add Duration
                </Button>
                <CardColumns>
                  {this.state.durations.map((durationObj, index) => {
                    return (
                      <Card
                        className="text-center"
                        bg="light"
                        text="dark"
                        key={index}
                      >
                        <Card.Header>
                          {durationObj.duration} {durationObj.unit}
                        </Card.Header>
                        <Card.Body>
                          <Card.Text>
                            Actual Price: {durationObj.original_price}/-
                          </Card.Text>
                          <Card.Text>
                            Combo Price: {durationObj.combo_price}/-
                          </Card.Text>
                        </Card.Body>
                        <Card.Footer>
                          <Button
                            variant="link"
                            onClick={() =>
                              this.removeDurationObjFromArr(
                                durationObj.duration
                              )
                            }
                          >
                            Remove
                          </Button>
                        </Card.Footer>
                      </Card>
                    );
                  })}
                </CardColumns>
                <div className="mt-3">
                  <Button
                    disabled={this.state.loading}
                    className="w-50 mt-2"
                    type="submit"
                    variant="success"
                  >
                    Save
                  </Button>

                  <Button
                    disabled={this.state.loading}
                    className="w-50 mt-2"
                    variant="danger"
                    onClick={() =>
                      this.setState({ showAddPlanFormFlag: false })
                    }
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            </Card.Body>
          )}
        </Card>
        {/* duration details */}
        {this.state.showDurationFormFlag && (
          <Card className="w-50 bg-secondary text-white m-3 p-1">
            <Form onSubmit={this.handleAddDurationSubmit}>
              <Form.Group id="duration">
                <Form.Label>
                  <strong>Duration</strong>
                </Form.Label>
                <Form.Control
                  type="number"
                  placeholder="how many months"
                  ref={this.durationRef}
                  min="1"
                  max="12"
                  required
                />
              </Form.Group>

              <Form.Group id="unit">
                <Form.Label>
                  <strong>Unit</strong>
                </Form.Label>
                <Form.Control as="select" ref={this.unitsRef}>
                  <option value="months">Months</option>
                </Form.Control>
              </Form.Group>

              <Form.Group id="originalPrice">
                <Form.Label>
                  <strong>Original Price</strong>
                </Form.Label>
                <Form.Control
                  type="number"
                  ref={this.originalPriceRef}
                  min="1"
                  max="50000"
                  required
                />
              </Form.Group>

              <Form.Group id="comboPrice">
                <Form.Label>
                  <strong>Combo Price</strong>
                </Form.Label>
                <Form.Control
                  type="number"
                  ref={this.comboPriceRef}
                  min="1"
                  max="50000"
                  required
                />
              </Form.Group>
              <hr />

              <Button
                disabled={this.state.loading}
                className="w-50 mt-2"
                type="submit"
                variant="success"
              >
                Add
              </Button>

              <Button
                disabled={this.state.loading}
                className="w-50 mt-2"
                variant="danger"
                onClick={() => this.setState({ showDurationFormFlag: false })}
              >
                Cancel
              </Button>
            </Form>
          </Card>
        )}
      </CardDeck>
    );
  };

  render() {
    return this.renderAddNewSubscriptionForm();
  }
}
