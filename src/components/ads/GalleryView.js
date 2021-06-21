import React, { Component } from "react";
import { Image, Carousel } from "react-bootstrap";

export default class GalleryView extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <strong>Gallery: {this.props.gallery.length}</strong>
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
  }
}
