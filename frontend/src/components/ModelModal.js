import React, {Component} from 'react';
import {FormControl, Modal} from 'react-bootstrap';
import Select from 'react-select';
import * as API from '../api/API';


class ModelModal extends Component{
    constructor(props){
        super(props);
        this.state = {
            prepModel: true,
            runModel: false,
            showResults: false,
            filterColumns: null,
            outputColumn: null,
        };

        this.changeTab = this.changeTab.bind(this);
    }

    componentDidMount() {
        // console.log(this.props.headers);
    }

    changeTab(tab){
        this.setState({
            prepModal: false,
            runModel: false,
            showResults: false
        });
        this.setState({
            [tab]: true
        })
    }

    render() {
        let options = [];

        if (this.props.headers.length) {
            this.props.headers.map((value) => {
                options.push({value: value, label: value});
            })
        }

        return (
            <Modal
                show={this.props.show}
                onHide={this.props.onHide}
                size={"lg"}
                className={"visualize-modal"}
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        Model Selection
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className={"lg-modal-content"}>
                    <div className={"model-tabs col-md-12"}>
                        <div className={(this.state.prepModel ? "tab-active" : "") + " tab-div col-md-2"} onClick={() => this.changeTab("prepModel")}>
                            <span>Prepare Modal</span>
                        </div>
                        <div className={(this.state.runModel ? "tab-active" : "") + " tab-div col-md-2"} onClick={() => this.changeTab("runModel")}>
                            <span>Run Modal</span>
                        </div>
                        <div className={(this.state.showResults ? "tab-active" : "") + " tab-div col-md-2"} onClick={() => this.changeTab("showResults")}>
                            <span>Test Results</span>
                        </div>
                    </div>
                    {this.state.prepModel ?
                        <div className={"prepModel-div"}>
                            <div className={"col-md-12"}>
                                <div className={"col-md-6"}>
                                    <h4>Choose the output column:</h4>
                                    <Select
                                        className={"filter-select"}
                                        value={this.state.outputColumn}
                                        onChange={(option) => this.setState({outputColumn: option})}
                                        options={options}
                                        isSearchable
                                        autoFocus
                                        name={"columns"}
                                        classNamePrefix={"filter-options"}
                                    />
                                </div>
                                <div className={"col-md-6"}>
                                    <h4>Choose one or more feature columns:</h4>
                                    <Select
                                        className={"filter-select"}
                                        value={this.state.filterColumns}
                                        onChange={(option) => this.setState({filterColumns: option})}
                                        options={options}
                                        isMulti
                                        isSearchable
                                        autoFocus
                                        name={"columns"}
                                        classNamePrefix={"filter-options"}
                                    />
                                </div>
                            </div>
                            <div className={"col-md-12"}>
                                <div className={"col-md-6"}>
                                    <h4>Test Split Data:</h4>
                                    <input className={"form-control input-md"} type={"text"}/>
                                </div>
                                <div className={"col-md-6"}>
                                    <h4>Train Split Data:</h4>
                                    <input className={"form-control input-md"} type={"text"}/>
                                </div>
                            </div>
                        </div> : null
                    }
                </Modal.Body>
            </Modal>
        )
    }
}

export default ModelModal;