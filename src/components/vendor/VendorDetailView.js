import { Component } from "react";
import { Table,Image } from "react-bootstrap";

export default class VendorDetailView extends Component {
  render() {
    const vendor = this.props.currVendor;
    return this.renderVendor(vendor);
  }

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
              <td style={{ color: "#ffc93c" }}>Category</td>
              <td>{vendor.category.join(", ")}</td>
            </tr>

            <tr>
              <td style={{ color: "#ffc93c" }}>Area</td>
              <td>{vendor.address.area}</td>
            </tr>

            <tr>
              <td style={{ color: "#ffc93c" }}>Address</td>
              <td>{vendor.address.full_address}</td>
            </tr>

            <tr>
              <td style={{ color: "#ffc93c" }}>Pincode</td>
              <td>{vendor.address.pincode}</td>
            </tr>

            <tr>
              <td style={{ color: "#ffc93c" }}>Status</td>
              <td
                style={{
                  color: this.props.getStatusTextColor(vendor.profile_status),
                }}
              >
                {vendor.profile_status}
              </td>
            </tr>
            <tr>
              <td style={{ color: "#ffc93c" }}>Subscription</td>
              <td
                style={{
                  color: this.props.getSubscriptionStatusTextColor(
                    vendor.subscription.status
                  ),
                }}
              >
                {vendor.subscription.status}
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
            {vendor.reviewer && (
              <tr>
                <td style={{ color: "#ffc93c" }}>Reviewer Name</td>
                <td>{vendor.reviewer.name}</td>
              </tr>
            )}
            {vendor.reviewer && (
              <tr>
                <td style={{ color: "#ffc93c" }}>Reviewer Email</td>
                <td>{vendor.reviewer.email}</td>
              </tr>
            )}
            {vendor.logoUrl && (
              <tr>
                <td style={{ color: "#ffc93c" }}>Logo</td>
                <td>
                  <Image
                    src={vendor.logoUrl}
                    rounded
                    style={{ width: 300, height: 200 }}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    );
  };
}
