import { Component } from "react";
import { Table } from "react-bootstrap";

export default class TopupPlanListView extends Component {
  render() {
    const plansList = this.props.plans;
    return this.renderCities(plansList);
  }

  renderCities = (plans) => {
    return (
      <div className="container mt-3">
        {plans && plans.length > 0 && (
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
                <tr>
                  <th>Plan</th>
                  <th>Coupons</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan, index) => (
                  <tr key={index}>
                    <td>{plan.name}</td>
                    <td>{plan.coupons}</td>
                    <td>{plan.price}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <strong>RECORDS DISPLAYED :</strong> {plans.length}
          </div>
        )}
      </div>
    );
  };
}
