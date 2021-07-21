import { Component } from "react";
import { Accordion, Card, ListGroup } from "react-bootstrap";

export default class ParentCategoriesListView extends Component {
  render() {
    const parentList = this.props.parents;
    return this.renderParentCategories(parentList);
  }

  renderParentCategories = (parents) => {
    return (
      <div className="container mt-3">
        {parents && parents.length > 0 && (
          <div>
            <Accordion>
              {parents.map((parent, index) => (
                <Card>
                  <Accordion.Toggle
                    as={Card.Header}
                    eventKey={index + 1}
                    className="bg-secondary text-white text-center"
                  >
                    <strong>{parent.name}</strong>
                  </Accordion.Toggle>
                  <Accordion.Collapse eventKey={index + 1}>
                    <Card>
                      <Card.Body className="bg-white">
                        <ListGroup variant="flush">
                          {parent.categories &&
                            parent.categories.map((category, catIndex) => (
                              <ListGroup.Item key={catIndex + "_" + category}>
                                {category}
                              </ListGroup.Item>
                            ))}
                        </ListGroup>
                      </Card.Body>
                    </Card>
                  </Accordion.Collapse>
                </Card>
              ))}
            </Accordion>
            <strong>RECORDS DISPLAYED :</strong> {parents.length}
          </div>
        )}
      </div>
    );
  };
}
