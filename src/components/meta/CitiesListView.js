import { Component } from "react";
import { Table } from "react-bootstrap";

export default class CitiesListView extends Component {
  render() {
    const citiesList = this.props.cities;
    return this.renderCities(citiesList);
  }

  renderCities = (cities) => {
    return (
      <div className="container mt-3">
        {cities && cities.length > 0 && (
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
                  <th>Code</th>
                  <th>Name</th>
                  <th>Vendors</th>
                  <th>Ads</th>
                  <th>Customers</th>
                </tr>
              </thead>
              <tbody>
                {cities.map((city, index) => {
                  return (
                    <tr key={index}>
                      <td>{city.code}</td>
                      <td>{city.name}</td>
                      <td>{city.stats.vendors}</td>
                      <td>{city.stats.ads}</td>
                      <td>{city.stats.customers}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            <strong>RECORDS DISPLAYED :</strong> {cities.length}
          </div>
        )}
      </div>
    );
  };
}
