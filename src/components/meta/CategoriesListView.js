import React, { Component } from "react";
import { Table, Form, Button } from "react-bootstrap";
import CategoriesListItem from "./CategoriesListItem";

export default class CategoriesListView extends Component {
  constructor(props) {
    super(props);
    this.keywordRef = React.createRef();
  }

  render() {
    const categoriesList = this.props.categories;
    if (categoriesList.length > 0) {
      return this.renderCategories(categoriesList);
    }
    return "loading categories....";
  }

  renderCategories = (categories) => {
    return (
      <div className="container mt-3">
        {categories && categories.length > 0 && (
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
                  <th>Uid</th>
                  <th>Parent</th>
                  <th>Name</th>
                  <th>Keywords</th>
                  <th>
                    <Button
                      className="w-100"
                      variant="success"
                      onClick={this.props.refreshCategoriesCallback}
                    >
                      Refresh
                    </Button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category, index) => (
                  <CategoriesListItem
                    key={index}
                    category={category}
                    appendKeywordsCallback={this.props.appendKeywordsCallback}
                  ></CategoriesListItem>
                ))}
              </tbody>
            </Table>
            <strong>RECORDS DISPLAYED :</strong> {categories.length}
          </div>
        )}
      </div>
    );
  };
}
