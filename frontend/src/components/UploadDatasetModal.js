import React, {Component} from 'react';
import {Button, Modal, Form} from 'react-bootstrap';

class UploadDatasetModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            validated: false,
        };

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();
        const form = event.currentTarget;
        let file = form.elements.formBasicFile.files[0];
        let name = form.elements.formBasicName.value;
        let description = form.elements.formBasicDescription.value;
        if (file === "undefined" || name === "undefined") {
            event.preventDefault();
            event.stopPropagation();
        }
        let fileData = {};
        if (description !== "undefined") {
            fileData = {
                file,
                name,
                description
            };
        } else {
            fileData = {
                file,
                name
            };
        }

        this.props.onSubmit(fileData);
        this.props.onHide();
        event.stopPropagation();
        // this.setState({validated: true});
    }

    render() {
        const {validated} = this.state;

        return (
            <Modal
                {...this.props}
                size={"md"}
                aria-labelledby="contained-modal-title-vcenter"
                className={"uploadModal"}
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        Upload a new dataset
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={(e) => this.handleSubmit(e)}>
                        <Form.Group controlId={"formBasicFile"}>
                            <Form.Label>Select the dataset to upload: <span className={"required"}>*</span></Form.Label>
                            <Form.Control type={"file"} required/>
                        </Form.Group>
                        <Form.Group controlId={"formBasicName"}>
                            <Form.Label>Enter a name for the dataset: <span className={"required"}>*</span></Form.Label>
                            <Form.Control type="text" required/>
                        </Form.Group>
                        <Form.Group controlId={"formBasicDescription"}>
                            <Form.Label>Provide an description (optional):</Form.Label>
                            <Form.Control as={"textarea"} rows={"5"} columns={"20"} maxLength={"256"}
                                          placeholder={"Maximum 256 characters"}/>
                        </Form.Group>
                        <Button type={"submit"}>Submit</Button>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                </Modal.Footer>
            </Modal>
        )
    }
}

export default UploadDatasetModal;