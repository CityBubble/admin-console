import { Component } from "react";
import { Table } from "react-bootstrap";

export default class VendorDetailView extends Component {
  render() {
    const vendor = this.props.currVendor;
    return this.renderVendor(vendor);
  }

  getStatusTextColor = (status) => {
    switch (status) {
      case "queued":
        return "#3d84b8";
      case "review":
        return "#ffab73";
      case "active":
        return "#8fd9a8";
      default:
        return "white";
    }
  };

  renderVendor = (vendor) => {
    return (
      <div className="container">
        <Table responsive="lg" striped bordered hover variant="dark" size="lg">
          <tbody>
            <tr>
              <td style={{ color: "#ffc93c" }}>Id</td>
              <td>{vendor.uid}</td>
            </tr>
            <tr>
              <td style={{ color: "#ffc93c" }}>Name</td>
              <td>{vendor.name}</td>
            </tr>
            <tr>
              <td style={{ color: "#ffc93c" }}>Contact</td>
              <td>{vendor.contact}</td>
            </tr>
            <tr>
              <td style={{ color: "#ffc93c" }}>Area</td>
              <td>{vendor.area}</td>
            </tr>
            <tr>
              <td style={{ color: "#ffc93c" }}>Category</td>
              <td>{vendor.category.join(", ")}</td>
            </tr>
            <tr>
              <td style={{ color: "#ffc93c" }}>Status</td>
              <td
                style={{
                  color: this.getStatusTextColor(vendor.status),
                }}
              >
                {vendor.status}
              </td>
            </tr>
            <tr>
              <td style={{ color: "#ffc93c" }}>Requested On</td>
              <td>
                {vendor.timeline.request_date
                  .toDate()
                  .toString()
                  .substring(0, 24)}
              </td>
            </tr>
            {vendor.timeline.review_date && (
              <tr>
                <td style={{ color: "#ffc93c" }}>Reviewed On</td>
                <td>
                  {vendor.timeline.review_date
                    .toDate()
                    .toString()
                    .substring(0, 24)}
                </td>
              </tr>
            )}
            {vendor.timeline.verify_date && (
              <tr>
                <td style={{ color: "#ffc93c" }}>Verified On</td>
                <td>
                  {vendor.timeline.verify_date
                    .toDate()
                    .toString()
                    .substring(0, 24)}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    );
  };
}
