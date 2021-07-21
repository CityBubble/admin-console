import React, { Component } from "react";
import { Table, Form, Button } from "react-bootstrap";

export default class CategoriesListItem extends Component {
  constructor(props) {
    super(props);
    this.keywordRef = React.createRef();
  }

  render() {
    if (this.props.category) {
      return this.renderCategoryRowItem(this.props.category);
    }
    return "";
  }

  renderCategoryRowItem = (category) => {
    return (
      <tr key={category.uid}>
        <td>{category.uid}</td>
        <td>{category.parent}</td>
        <td>{category.name}</td>
        <td>
          <Form.Group id="keywords">
            <Form.Control
              key={category.uid}
              as="textarea"
              rows={3}
              defaultValue={category.keywords.join(", ")}
              ref={this.keywordRef}
            />
          </Form.Group>
        </td>
        <td>
          <Button
            className="w-100"
            onClick={() =>
              this.props.appendKeywordsCallback(
                category,
                this.keywordRef.current.value
              )
            }
          >
            Add Keywords
          </Button>
        </td>
      </tr>
    );
  };
}
