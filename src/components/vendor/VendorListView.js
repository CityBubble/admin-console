import { Component } from "react";
import { Table } from "react-bootstrap";

export default class VendorListView extends Component {
  render() {
    const vendorList = this.props.vendorList;
    return this.renderVendors(vendorList);
  }

  renderVendors = (vendors) => {
    return (
      <div className="container mt-3">
        <hr />
        {vendors && vendors.length > 0 && (
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
                  {/* <th>Id</th> */}
                  <th>Name</th>
                  <th>Area</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Subscription</th>
                  <th>Request Date</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor, index) => {
                  return (
                    <tr
                      key={index}
                      onClick={() => {
                        this.props.onVendorClicked(vendor);
                      }}
                    >
                      {/* <td>{vendor.uid}</td> */}
                      <td>{vendor.name}</td>
                      <td>{vendor.address.area}</td>
                      <td>{vendor.category.join(", ")}</td>
                      <td
                        style={{
                          color: this.props.getStatusTextColor(
                            vendor.profile_status
                          ),
                        }}
                      >
                        {vendor.profile_status}
                      </td>
                      <td
                        style={{
                          color: this.props.getSubscriptionStatusTextColor(
                            vendor.subscription.status
                          ),
                        }}
                      >
                        {vendor.subscription.status}
                      </td>
                      <td>
                        {vendor.timeline.request_date
                          .toDate()
                          .toString()
                          .substring(3, 15)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            <strong>RECORDS DISPLAYED :</strong> {vendors.length}
          </div>
        )}
      </div>
    );
  };
}
