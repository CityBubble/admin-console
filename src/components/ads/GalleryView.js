import React, { Component } from "react";
import { Image, Carousel, Button, Card, CardColumns } from "react-bootstrap";

export default class GalleryView extends Component {
  canRemoveImages = false;

  constructor(props) {
    super(props);
    this.state = {
      localGallery: this.props.gallery,
      removedUrls: [],
    };
    this.currentGallery = this.props.gallery;
    this.canRemoveImages = this.props.canRemove ? this.props.canRemove : false;
  }

  handleRemove = (imageUrl) => {
    console.log("handleRemoveImage " + imageUrl);
    this.setState(
      {
        localGallery: this.state.localGallery.filter(
          (item) => item !== imageUrl
        ),
        removedUrls: [...this.state.removedUrls, imageUrl],
      },
      () => {
        this.props.galleryModifiedCallback({
          modifiedGallery: this.state.localGallery,
          removedUrls: this.state.removedUrls,
        });
      }
    );
  };

  handleReset = () => {
    console.log("handleRemoveImage ");
    this.setState(
      {
        localGallery: this.props.gallery,
        removedUrls: [],
      },
      () => {
        this.props.galleryModifiedCallback({
          modifiedGallery: this.state.localGallery,
          removedUrls: this.state.removedUrls,
        });
      }
    );
  };

  render() {
    return this.canRemoveImages ? this.renderLocally() : this.renderFromProps();
  }

  renderLocally = () => {
    return (
      <div>
        <div className="row mb-3">
          <div className="col">
            <strong>Count: {this.state.localGallery.length}</strong>
          </div>
          <div className="col">
            <Button onClick={this.handleReset}>Reset Gallery</Button>
          </div>
        </div>

        <CardColumns>
          {this.state.localGallery.map((imgItem, index) => {
            return (
              <Card key={index}>
                <Image
                  key={index}
                  className="d-block w-100"
                  src={imgItem}
                  style={{ width: 300, height: 120 }}
                />
                <Card.Footer
                  className="text-center"
                  onClick={() => this.handleRemove(imgItem)}
                >
                  <small className="text-muted">Remove</small>
                </Card.Footer>
              </Card>
            );
          })}
        </CardColumns>
      </div>
    );
  };

  renderFromProps = () => {
    return (
      <div>
        <strong>Count: {this.props.gallery.length}</strong>
        <Carousel variant="dark">
          {this.props.gallery.map((imgItem, index) => {
            return (
              <Carousel.Item key={index}>
                <Image
                  key={index}
                  className="mt-2 d-block w-100"
                  src={imgItem.url ? imgItem.url : imgItem}
                  style={{ width: 300, height: 250 }}
                />
              </Carousel.Item>
            );
          })}
        </Carousel>
      </div>
    );
  };
}
