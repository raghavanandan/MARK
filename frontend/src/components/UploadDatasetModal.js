import React, {Component} from 'react';
import {Modal, Form} from 'react-bootstrap';

class UploadDatasetModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            validated: false,
            isHeaderPresent : null
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
                headers : this.state.isHeaderPresent,
                description
            };
        } else {
            fileData = {
                file,
                name,
                headers : this.state.isHeaderPresent
            };
        }

        this.props.onSubmit(fileData);
        this.props.onHide();
        event.stopPropagation();
    }

    render() {

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
                <Modal.Body className={"no-pad"}>
                    <Form className={"form-pad"} onSubmit={(e) => this.handleSubmit(e)}>
                        <Form.Group controlId={"formBasicFile"}>
                            <Form.Label>Select the dataset to upload: <span className={"required"}>*</span></Form.Label>
                            <Form.Control type={"file"} required/>
                        </Form.Group>
                        <div className={"col-md-12 form-group"}>
                            <label className={"col-md-12 no-pad"}>Does the file contain column headers ? <span className={"required"}>*</span></label>
                                <input type={"radio"} name={"headers"} id={"yes"} onChange={() => this.setState({isHeaderPresent: true})}/>&nbsp;&nbsp;&nbsp;
                                <label htmlFor={"yes"}>Yes</label>&nbsp;&nbsp;&nbsp;
                                <input type={"radio"} name={"headers"} id={"no"} onChange={() => this.setState({isHeaderPresent: false})}/>&nbsp;&nbsp;&nbsp;
                                <label htmlFor={"no"}>No</label>
                        </div>
                        <Form.Group controlId={"formBasicName"}>
                            <Form.Label>Enter a name for the dataset: <span className={"required"}>*</span></Form.Label>
                            <Form.Control type="text" placeholder={"Name of the file"} required/>
                        </Form.Group>
                        <Form.Group controlId={"formBasicDescription"}>
                            <Form.Label>Provide an description (optional):</Form.Label>
                            <Form.Control as={"textarea"} rows={"5"} columns={"20"} maxLength={"256"}
                                          placeholder={"Maximum 256 characters"}/>
                        </Form.Group>
                        <div className={"btn-group"}>
                            <button className={"action-btn pull-right"} type={"submit"}>Submit</button>
                            <button className={'cancel-btn pull-right'} onClick={this.props.onHide}>Cancel</button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        )
    }
}

export default UploadDatasetModal;