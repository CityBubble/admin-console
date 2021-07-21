import { Component } from "react";
import {
  Table,
  Button,
  Carousel,
  Card,
  CardColumns,
  CardDeck,
} from "react-bootstrap";

export default class SubscriptionsListView extends Component {
  render() {
    const subscriptionList = this.props.subscriptions;
    return this.renderSubscriptions(subscriptionList);
  }

  renderSubscriptions = (subscriptions) => {
    return (
      <div className="container mt-3">
        {subscriptions && subscriptions.length > 0 && (
          <div>
            <Table
              responsive="lg"
              striped
              bordered
              hover
              variant="dark"
              size="lg"
            >
              <thead style={{ color: "#ffc93c" }}>
                <tr className="text-center">
                  <th>Name</th>
                  <th>Priority</th>
                  <th>Max Gallery Size</th>
                  <th>Durations</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((subscription, index) => (
                  <tr key={index}>
                    <td>{subscription.name}</td>
                    <td>{subscription.priority}</td>
                    <td>{subscription.gallery}</td>
                    <td>
                      <CardColumns>
                        {subscription.durations.map((durationObj, index) => {
                          return (
                            <Card
                              className="text-center"
                              bg="secondary"
                              text="light"
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
                            </Card>
                          );
                        })}
                      </CardColumns>
                    </td>
                    <td>
                      <Button
                        variant="link"
                        onClick={() =>
                          this.props.removeSubscriptionCallback(
                            subscription.name
                          )
                        }
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <strong>RECORDS DISPLAYED :</strong> {subscriptions.length}
          </div>
        )}
      </div>
    );
  };
}
