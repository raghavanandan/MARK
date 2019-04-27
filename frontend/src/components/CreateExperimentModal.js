import React, {Component} from 'react';
import {Form, Modal} from 'react-bootstrap';
import * as API from '../api/API';

class CreateExperimentModal extends Component{
    constructor(props){
        super(props);
        this.state = {
            docId: this.props.doc_id
        };

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        // console.log(this.props);
    }

    handleSubmit(event) {
        const form = event.currentTarget;
        const expData = {
            docId: this.state.docId,
            name: form.elements.formBasicName.value,
            description: form.elements.formBasicDescription.value
        };
        API.createDF(expData).then((data) => {
            if (data !== 400) {
                console.log(data);
                // this.props.alert("Yes");
            }
        }).catch((err) => {
            console.log(err);
        });
        this.props.onHide();
        event.stopPropagation();
        event.preventDefault();
    }

    render() {
        return(
            <Modal
                {...this.props}
                size={"md"}
                aria-labelledby="contained-modal-title-vcenter"
                className={"uploadModal"}
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        Create a new experiment
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className={"no-pad"}>
                    <Form className={"form-pad"} onSubmit={(e) => this.handleSubmit(e)}>
                        <Form.Group controlId={"formBasicName"}>
                            <Form.Label>Enter a name for the experiment: <span className={"required"}>*</span></Form.Label>
                            <Form.Control type="text" placeholder={"Name of the experiment"} required/>
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

export default CreateExperimentModal;