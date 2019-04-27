import React, {Component} from 'react';
import {Modal} from 'react-bootstrap';
import Select from 'react-select';
import * as API from '../api/API';
import * as PARAMS from '../utils/params';


class ModelModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            prepModel: true,
            runModel: false,
            showResults: false,
            otherOptions: [],
            filterColumns: null,
            targetColumn: null,
            trainSplit: 0,
            testSplit: 0,
            alert: '',
            filterModels: [],
            chosenModels: [],
            paramValues: [],
            testData: "",
            trainData: "",
            dataHeaders: "",
            predictionResults: "",
            isTuning: false,
            showfMeasure: true,
            showAccuracy: false,
            showPrecision: false,
            showRecall: false
        };

        this.changeTab = this.changeTab.bind(this);
        this.validateValue = this.validateValue.bind(this);
        this.updateTestSplit = this.updateTestSplit.bind(this);
        this.updateTrainSplit = this.updateTrainSplit.bind(this);
        this.prepareModel = this.prepareModel.bind(this);
        this.updateFeatureColumns = this.updateFeatureColumns.bind(this);
        this.updateModelParams = this.updateModelParams.bind(this);
        this.predictModel = this.predictModel.bind(this);
        this.togglePredictionResults = this.togglePredictionResults.bind(this);
        this.populateParamValues = this.populateParamValues.bind(this);
    }

    componentDidMount() {
        // console.log(this.props.headers);
    }

    togglePredictionResults(e) {
        if (e.target.value === "fMeasure") {
            this.setState({
                showfMeasure: true,
                showAccuracy: false,
                showPrecision: false,
                showRecall: false
            })
        } else if (e.target.value === "Accuracy") {
            this.setState({
                showfMeasure: false,
                showAccuracy: true,
                showPrecision: false,
                showRecall: false
            })
        } else if (e.target.value === "Precision") {
            this.setState({
                showfMeasure: false,
                showAccuracy: false,
                showPrecision: true,
                showRecall: false
            })
        } else if (e.target.value === "Recall") {
            this.setState({
                showfMeasure: false,
                showAccuracy: false,
                showPrecision: false,
                showRecall: true
            })
        }
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

    populateParamValues(e, model, type) {
        model = model.toLowerCase().split(" ").join("_");
        // console.log(model + ' ' + e.target.name + ' ' + e.target.value);
        if (!this.state.chosenModels.includes(model)) {

            let prev = this.state.paramValues;

            if (prev.length) {
                for (let key in prev) {
                    if (prev[key]['model'] === model) {
                        if (type === "kfold") {
                            prev[key]["kfold"] = e.target.value;
                            break;
                        }
                        prev[key]['hyper_params'][e.target.name] = e.target.value;
                    }
                }
            }

            this.setState({
                paramValues: prev
            }, () => console.log(this.state.paramValues));

        }
    }

    updateModelParams(option) {
        let prevModels = [];
        let models = [];
        let paramValues = [];
        for (let key in this.state.paramValues) {
            prevModels.push(this.state.paramValues[key]['model'])
        }
        for (let key in option) {
            if (!prevModels.includes(option[key].value)) {
                models.push(option[key].value);
            }
        }

        for (let key in models) {
            let hyper_params = {};
            let model = models[key];
            let params = PARAMS['hyper_params'][model];
            for (let index in params) {
                hyper_params[params[index].name] = params[index].defaultValue
            }
            paramValues.push({
                "model": model.toLowerCase().split(" ").join("_"),
                "hyper_params": hyper_params,
                "kfold": 2
            })
        }

        // console.log(paramValues);

        this.setState({filterModels: option, paramValues: paramValues}, () => console.log(this.state.paramValues));
    }

    updateFeatureColumns(option) {
        let objArray = [];

        if (this.props.headers.length) {
            this.props.headers.map((value) => {
                if (value !== option.value) {
                    objArray.push({value: value, label: value});
                }
            })
        }
        this.setState({
            targetColumn: option,
            otherOptions: objArray
        });
    }

    updateTrainSplit(e) {
        if (this.validateValue(e.target.value)) {
            this.setState({trainSplit: +e.target.value});
        } else {
            this.setState({alert: "Invalid input for train data"});
        }
    }

    updateTestSplit(e) {
        if (this.validateValue(e.target.value)) {
            this.setState({testSplit: +e.target.value});
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
            trainSplit: this.state.trainSplit,
            testSplit: this.state.testSplit
        };

        API.prepareModel(modelData).then((data) => {
            if (data !== 400) {
                // console.log(data);
                this.setState({
                    trainData: data['training_set']['docs'],
                    testData: data['testing_set']['docs'],
                    dataHeaders: data['header'],
                    prepModel: false,
                    runModel: true
                });
            }
        }).catch((err) => {
            console.log(err);
        })
    }

    predictModel() {
        // console.log(this.state.paramValues);
        API.predictModel({outputCol: this.state.targetColumn.value, data: this.state.paramValues}).then((data) => {
            if (data !== 400) {
                let keys = Object.keys(data);
                let arr = [];
                let obj = this.state.testData;
                let headers = this.state.dataHeaders;
                for (let key in obj) {
                    for (let index in keys) {
                        let new_key = this.state.targetColumn.value + '_' + keys[index];
                        if (!arr.includes(new_key)) {
                            arr.push(new_key);
                            headers.push({header: new_key});
                        }

                        obj[key][new_key] = data[keys[index]]['prediction']['docs'][key];
                    }
                }
                this.setState({predictionResults: data, testData: obj, dataHeaders: headers, runModel: false, showResults: true});
            }
        }).catch((err) => {
            console.log(err);
        })
    }

    showPrepModel() {
        let options = [];

        if (this.props.headers.length) {
            this.props.headers.map((value) => {
                options.push({value: value, label: value});
            })
        }

        return (
            <div className={"model-div col-md-12"}>
                <div className={"form-group col-md-6"}>
                    <h4>Choose the target column:</h4>
                    <Select
                        className={"filter-select"}
                        value={this.state.targetColumn}
                        onChange={this.updateFeatureColumns}
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
                        options={this.state.otherOptions}
                        isMulti
                        isSearchable
                        autoFocus
                        name={"columns"}
                        classNamePrefix={"filter-options"}
                    />
                </div>
                <div className={"form-group col-md-6"}>
                    <h4>Train Split Data:</h4>
                    <input className={"form-control input-md"} type={"text"} maxLength={3} placeholder={"Enter train data %"} onChange={this.updateTrainSplit}/>
                </div>
                <div className={"form-group col-md-6"}>
                    <h4>Test Split Data:</h4>
                    <input className={"form-control input-md"} type={"text"} maxLength={3} placeholder={"Enter test data %"} onChange={this.updateTestSplit} />
                </div>
            </div>
        )
    }

    showRunModel() {
        let options = [];

        PARAMS.models.forEach((item) => {
           options.push({value: item, label: item})
        });

        return (
            <div className={"model-div col-md-12"}>
                <div className={"form-group col-md-6"}>
                    <h4>Choose one or more models:</h4>
                    <Select
                        className={"filter-select"}
                        value={this.state.filterModels}
                        onChange={this.updateModelParams}
                        options={options}
                        isMulti
                        isSearchable
                        autoFocus
                        name={"models"}
                        classNamePrefix={"filter-options"}
                    />
                </div>
                {this.state.filterModels.length ?
                    <div className={"form-group model-form col-md-6"}>
                        <h3>Hyper Parameters</h3>
                        <hr className={"stat-separator"}/>
                        <label className={"enable-tuning"}>
                            <input type={"checkbox"} onChange={() => this.setState({isTuning: !this.state.isTuning})} /> &nbsp;&nbsp;
                            Enable Parameter Tuning
                        </label>
                        {this.state.filterModels.map((value, index) => (
                            <div key={index}>
                                <h3 className={"less-margin text-center"} >{value.value}</h3>
                                <div className={"form-group col-md-12"}>
                                    <label className={"col-md-6"}>K-fold</label>
                                    <div className={"col-md-6"}>
                                        <input
                                            type={"text"}
                                            name={"kfold"}
                                            className={"form-control input-sm"}
                                            placeholder={"Enter the k-fold value"}
                                            disabled={!this.state.isTuning}
                                            onChange={(e) => this.populateParamValues(e, value.value, "kfold")}
                                        />
                                    </div>
                                </div>
                                {PARAMS.hyper_params[value.value].map((param, index) => (
                                    <div className={"form-group col-md-12"} key={index}>
                                        <label className={"col-md-6"}>{param.name}</label>
                                        <div className={"col-md-6"}>
                                            <input
                                                type={"text"}
                                                name={param.name}
                                                className={"form-control input-sm"}
                                                placeholder={"Enter comma separated values"}
                                                onChange={(e) => this.populateParamValues(e, value.value, null)}
                                                disabled={!this.state.isTuning}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div> : null
                }
            </div>
        )
    }

    showTestResults() {
        // console.log(this.state.dataHeaders);
        // console.log(this.state.trainData);
        // console.log(this.state.testData);
        // console.log(this.state.predictionResults);
        return (
            <div className={"model-div col-md-12"}>
                <div className={"col-md-4 right-bordered"}>
                    <h3>Train Data</h3>
                    {this.state.dataHeaders && this.state.testData && this.state.trainData && this.state.predictionResults ?
                        <div className={"scrollable-table-div"}>
                            <table className={"table table-striped"}>
                                <thead>
                                    <tr>
                                        {this.state.dataHeaders.map((value, index) => (
                                            <th className={"text-center"} key={index}>{value.header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.trainData.map((value, index) => (
                                        <tr className={"text-center"} key={index}>
                                            {this.state.dataHeaders.map((header, index) => (
                                                <td key={index}>{value[header.header]}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        : "No data"}
                </div>
                <div className={"col-md-4 right-bordered"}>
                    <h3>Test Data</h3>
                    {this.state.dataHeaders && this.state.testData && this.state.trainData && this.state.predictionResults ?
                        <div className={"scrollable-table-div"}>
                            <table className={"table table-striped"}>
                                <thead>
                                <tr>
                                    {this.state.dataHeaders.map((value, index) => (
                                        <th className={"text-center"} key={index}>{value.header}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {this.state.testData.map((value, index) => (
                                    <tr className={"text-center"} key={index}>
                                        {this.state.dataHeaders.map((header, index) => (
                                            <td key={index}>{value[header.header]}</td>
                                        ))}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        : "No data"}
                </div>
                <div className={"col-md-4"}>
                    <h3>Prediction Results</h3>
                    {this.state.dataHeaders && this.state.testData && this.state.trainData && this.state.predictionResults ?
                        <div className={"scrollable-table-div"}>
                            {this.state.filterModels.map((model, index) => (
                                <div key={index}>
                                    <h3 className={"less-margin text-center"} >{model.value}</h3>
                                    <div className={"col-md-12"}>
                                        <label>Show:</label> &nbsp;
                                        <select onChange={(e) => this.togglePredictionResults(e)}>
                                            <option value={"fMeasure"}>fMeasure</option>
                                            <option value={"Accuracy"}>Accuracy</option>
                                            <option value={"Precision"}>Precision</option>
                                            <option value={"Recall"}>Recall</option>
                                        </select>
                                    </div>
                                    <div className={"col-md-12"}>
                                        {this.state.showfMeasure ?
                                        <>
                                            <label className={"col-md-3 no-pad"}>fMeasure:</label>
                                            <span className={"col-md-9"}>{this.state.predictionResults[model.value.toLowerCase().split(" ").join("_")]['fMeasure']}</span>
                                        </>: null
                                        }
                                        {this.state.showAccuracy ?
                                        <>
                                            <label className={"col-md-3 no-pad"}>Accuracy:</label>
                                            <span className={"col-md-9"}>{this.state.predictionResults[model.value.toLowerCase().split(" ").join("_")]['accuracy']}</span>
                                        </> : null
                                        }
                                        {this.state.showPrecision ?
                                        <>
                                            <label className={"col-md-3 no-pad"}>Precision:</label>
                                            <span className={"col-md-9"}>{this.state.predictionResults[model.value.toLowerCase().split(" ").join("_")]['precision']}</span>
                                        </> : null
                                        }
                                        {this.state.showRecall ?
                                        <>
                                            <label className={"col-md-3 no-pad"}>Recall:</label>
                                            <span className={"col-md-9"}>{this.state.predictionResults[model.value.toLowerCase().split(" ").join("_")]['recall']}</span>
                                        </> : null
                                        }
                                    </div>
                                </div>
                            ))}
                        </div>
                        : "No data"
                    }
                </div>
            </div>
        )
    }

    render() {

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
                    <div className={"modal-tabs col-md-12"}>
                        <div className={(this.state.prepModel ? "tab-active" : "") + " tab-div col-md-2 text-center"}
                             onClick={() => this.changeTab("prepModel")}>
                            <span>Prepare Modal</span>
                        </div>
                        <div className={(this.state.runModel ? "tab-active" : "") + " tab-div col-md-2 text-center"}
                             onClick={() => this.changeTab("runModel")}>
                            <span>Run Models</span>
                        </div>
                        <div className={(this.state.showResults ? "tab-active" : "") + " tab-div col-md-2 text-center"}
                             onClick={() => this.changeTab("showResults")}>
                            <span>Test Results</span>
                        </div>
                    </div>
                    {this.state.prepModel ?
                        this.showPrepModel() : null
                    }
                    {this.state.runModel ?
                        this.showRunModel() : null
                    }
                    {this.state.showResults ?
                        this.showTestResults() : null
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
                            <button className={"action-btn pull-right"} type={"submit"} onClick={this.state.prepModel ? this.prepareModel : this.predictModel}>
                                {this.state.prepModel ?
                                    "Prepare Model" : "Run Models"
                                }
                            </button>
                            <button className={'cancel-btn pull-right'} onClick={this.props.onHide}>Cancel</button>
                        </div>
                    ) : <div className={"btn-group"}>
                            <button className={'cancel-btn pull-right'} onClick={this.props.onHide}>Cancel</button>
                        </div>
                }
            </Modal>
        )
    }
}

export default ModelModal;