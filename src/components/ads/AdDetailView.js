import { Component } from "react";
import { Table } from "react-bootstrap";

export default class AdDetailView extends Component {
  render() {
    const currentAd = this.props.currAd;
    return this.renderAd(currentAd);
  }

  renderAd = (currentAd) => {
    return (
      <div className="container">
        <Table responsive="lg" striped bordered hover variant="dark" size="lg">
          <tbody>
            <tr>
              <td style={{ color: "#ffc93c" }}>Ad Id</td>
              <td>{currentAd.uid}</td>
            </tr>
            <tr>
              <td style={{ color: "#ffc93c" }}>Vendor</td>
              <td>{currentAd.vendor.name}</td>
            </tr>
            <tr>
              <td style={{ color: "#ffc93c" }}>Priority</td>
              <td>{this.props.getPriority(currentAd.priority)}</td>
            </tr>
            <tr>
              <td style={{ color: "#ffc93c" }}>Category</td>
              <td>{currentAd.vendor.category.join(", ")}</td>
            </tr>
            <tr>
              <td style={{ color: "#ffc93c" }}>Tagline</td>
              <td>{currentAd.raw.tagline}</td>
            </tr>
            <tr>
              <td style={{ color: "#ffc93c" }}>Description</td>
              <td>{currentAd.raw.desc}</td>
            </tr>
            <tr>
              <td style={{ color: "#ffc93c" }}>Requested On</td>
              <td>
                {currentAd.timeline.request_date
                  .toDate()
                  .toString()
                  .substring(0, 24)}
              </td>
            </tr>
            {currentAd.timeline.publish_date && (
              <tr>
                <td style={{ color: "#ffc93c" }}>Published On</td>
                <td>
                  {currentAd.timeline.publish_date
                    .toDate()
                    .toString()
                    .substring(0, 24)}
                </td>
              </tr>
            )}
            {currentAd.timeline.expiry_date && (
              <tr>
                <td style={{ color: "#ffc93c" }}>Expiry Date</td>
                <td>
                  {currentAd.timeline.expiry_date
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
