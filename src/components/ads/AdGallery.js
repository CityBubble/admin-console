import React, { Component } from "react";
import { Form, Card, Image, CloseButton } from "react-bootstrap";

export default class AdGallery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gallery: [],
      maxImgCount: this.props.maxCount,
      currImgCount: 0,
    };
  }

  handleImgSelection = (e) => {
    console.log("handle image selection");
    if (e.target.files) {
      console.log(e.target.files);
      let tempGallery = [...this.state.gallery];
      let imgFile = e.target.files[0];
      tempGallery.push({
        url: URL.createObjectURL(imgFile),
        img: imgFile,
      });
      this.setState(
        {
          gallery: tempGallery,
          currImgCount: tempGallery.length,
          imgModify: true,
          imagesTagged: false,
        },
        () => {
          this.tagImages();
        }
      );
    }
  };

  tagImages = () => {
    this.props.tagImages(this.state.gallery);
  };

  handleRemoveImage = (imgFile) => {
    console.log("handleRemoveImage " + imgFile.img.name);
    this.setState(
      {
        gallery: this.state.gallery.filter((item) => item.url !== imgFile.url),
        currImgCount: this.state.currImgCount - 1,
      },
      () => {
        this.tagImages();
      }
    );
  };

  render() {
    return (
      <Card style={{ width: "auto" }}>
        <Card.Title className="text-center mt-1">Gallery</Card.Title>
        <Card.Body>
          <Form>
            {this.state.currImgCount < this.state.maxImgCount && (
              <Form.Group>
                <Form.File id="gallery" custom className="mt-3">
                  <Form.File.Input
                    isValid
                    onChange={this.handleImgSelection}
                    accept="image/*"
                  />
                  <Form.File.Label data-browse="Browse">
                    Upload Image
                  </Form.File.Label>
                </Form.File>
              </Form.Group>
            )}

            {this.state.gallery &&
              this.state.gallery.length > 0 &&
              this.state.gallery.map((item, index) => {
                return (
                  <div key={index}>
                    <div className="row">
                      <div className="col">
                        <Image
                          key={index}
                          className="mt-2"
                          src={item.url}
                          rounded
                          style={{ width: 400, height: 250 }}
                        />
                      </div>
                      <div className="col">
                        <CloseButton
                          onClick={() => this.handleRemoveImage(item)}
                        ></CloseButton>
                      </div>
                    </div>
                    <hr />
                  </div>
                );
              })}
          </Form>
        </Card.Body>
      </Card>
    );
  }
}
