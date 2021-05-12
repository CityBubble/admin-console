import { Component } from "react";
import { Table } from "react-bootstrap";

export default class VendorListView extends Component {
  render() {
    const vendorList = this.props.vendorList;
    return this.renderVendors(vendorList);
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
                  <th>Request Date</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor, index) => {
                  return (
                    <tr
                      className="mt-3"
                      key={index}
                      onClick={() => {
                        alert(vendor.name + " " + index);
                      }}
                    >
                      {/* <td>{vendor.uid}</td> */}
                      <td>{vendor.name}</td>
                      <td>{vendor.area}</td>
                      <td>{vendor.category.join(", ")}</td>
                      <td
                        style={{
                          color: this.getStatusTextColor(vendor.status),
                        }}
                      >
                        {vendor.status}
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
