import React, {Component} from 'react';
import {Modal} from 'react-bootstrap';
import Select from 'react-select';
import * as API from '../api/API';


class ModelModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            prepModel: true,
            runModel: false,
            showResults: false,
            filterColumns: null,
            targetColumn: null,
            trainData: 0,
            testData: 0,
            alert: '',
        };

        this.changeTab = this.changeTab.bind(this);
        this.validateValue = this.validateValue.bind(this);
        this.updateTestData = this.updateTestData.bind(this);
        this.updateTrainData = this.updateTrainData.bind(this);
        this.prepareModel = this.prepareModel.bind(this);
    }

    componentDidMount() {
        // console.log(this.props.headers);
    }

    changeTab(tab) {
        if (tab === "prepModel") {
            this.setState({
                prepModel: true,
                runModel: false,
                showResults: false
            })
        } else if (tab === "runModel") {
            this.setState({
                prepModel: false,
                runModel: true,
                showResults: false
            })
        } else {
            this.setState({
                prepModel: false,
                runModel: false,
                showResults: true
            })
        }
    }

    updateTrainData(e) {
        if (this.validateValue(e.target.value)) {
            this.setState({trainData: +e.target.value});
        } else {
            this.setState({alert: "Invalid input for train data"});
        }
    }

    updateTestData(e) {
        if (this.validateValue(e.target.value)) {
            this.setState({testData: +e.target.value});
        } else {
            this.setState({alert: "Invalid input for test data"});
        }
    }

    validateValue(value) {
        if (+value === +value && +value <= 100) {
            this.setState({alert: ''});
            return true;
        }
        return false;
    }

    prepareModel() {
        let featureCol = [];
        for (let key in this.state.filterColumns) {
            featureCol.push(this.state.filterColumns[key]['value'])
        }

        let modelData = {
            outputCol: this.state.targetColumn.value,
            featureCol: featureCol,
            trainSplit: this.state.trainData,
            testSplit: this.state.testData
        };
        console.log(modelData);
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
                        <div className={(this.state.prepModel ? "tab-active" : "") + " tab-div col-md-2"}
                             onClick={() => this.changeTab("prepModel")}>
                            <span>Prepare Modal</span>
                        </div>
                        <div className={(this.state.runModel ? "tab-active" : "") + " tab-div col-md-2"}
                             onClick={() => this.changeTab("runModel")}>
                            <span>Run Modal</span>
                        </div>
                        <div className={(this.state.showResults ? "tab-active" : "") + " tab-div col-md-2"}
                             onClick={() => this.changeTab("showResults")}>
                            <span>Test Results</span>
                        </div>
                    </div>
                    {this.state.prepModel ?
                        <div className={"prepModel-div col-md-12"}>
                            <div className={"form-group col-md-6"}>
                                <h4>Choose the target column:</h4>
                                <Select
                                    className={"filter-select"}
                                    value={this.state.targetColumn}
                                    onChange={(option) => this.setState({targetColumn: option})}
                                    options={options}
                                    isSearchable
                                    autoFocus
                                    name={"columns"}
                                    classNamePrefix={"filter-options"}
                                />
                            </div>
                            <div className={"form-group col-md-6"}>
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
                            <div className={"form-group col-md-6"}>
                                <h4>Train Split Data:</h4>
                                <input className={"form-control input-md"} type={"text"} maxLength={3} placeholder={"Enter train data %"} onChange={this.updateTrainData}/>
                            </div>
                            <div className={"form-group col-md-6"}>
                                <h4>Test Split Data:</h4>
                                <input className={"form-control input-md"} type={"text"} maxLength={3} placeholder={"Enter test data %"} onChange={this.updateTestData} />
                            </div>
                        </div> : null
                    }
                    {this.state.alert ? (
                        <div className={"col-md-6 col-md-offset-3 text-center alert alert-danger"}>
                            <h4>{this.state.alert}</h4>
                        </div>
                        ) : null
                    }
                </Modal.Body>
                {!this.state.showResults ?
                    (
                        <div className={"btn-group"}>
                            <button className={"action-btn pull-right"} type={"submit"} onClick={this.prepareModel}>
                                {this.state.prepModel ?
                                    "Prepare Model" : "Run Models"
                                }
                            </button>
                            <button className={'cancel-btn pull-right'} onClick={this.props.onHide}>Cancel</button>
                        </div>
                    ) : null
                }
            </Modal>
        )
    }
}

export default ModelModal;