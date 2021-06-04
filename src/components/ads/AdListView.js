import { Component } from "react";
import { Table } from "react-bootstrap";

export default class AdsListView extends Component {
  render() {
    const adsList = this.props.adsList;
    return this.renderAds(adsList);
  }

  renderAds = (ads) => {
    return (
      <div className="container mt-3">
        <hr />
        {ads && ads.length > 0 && (
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
                  <th>Vendor</th>
                  <th>Tagline</th>
                  <th>Area</th>
                  <th>Category</th>
                  <th>Ad Status</th>
                  <th>Request Date</th>
                </tr>
              </thead>
              <tbody>
                {ads.map((currentAd, index) => {
                  return (
                    <tr
                      key={index}
                      onClick={() => {
                        this.props.onAdClicked(currentAd);
                      }}
                    >
                      <td>{currentAd.vendor.name}</td>
                      <td>{currentAd.raw.tagline}</td>
                      <td>{currentAd.vendor.address.area}</td>
                      <td>{currentAd.vendor.category.join(", ")}</td>
                      <td
                        style={{
                          color: this.props.getStatusTextColor(
                            currentAd.ad_status.status
                          ),
                        }}
                      >
                        {currentAd.ad_status.status}
                      </td>
                      <td>
                        {currentAd.timeline.request_date
                          .toDate()
                          .toString()
                          .substring(3, 15)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            <strong>RECORDS DISPLAYED :</strong> {ads.length}
          </div>
        )}
      </div>
    );
  };
}
