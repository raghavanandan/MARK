import React, {Component} from 'react';
import Select from "react-select";
import * as API from "../api/API";
import {Loader} from "./Loader";
import {PredictedDataModal} from "./PredictedDataModal";
import * as PARAMS from "../utils/params";

import ReactFC from 'react-fusioncharts';
import FusionCharts from 'fusioncharts';
import Column2D from 'fusioncharts/fusioncharts.charts';
import FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion';
ReactFC.fcRoot(FusionCharts, Column2D, FusionTheme);

class TrainContent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loader: false,
            showResults: false,
            expId: this.props.expId,
            headers: [],
            predictionHeaders: [],
            targetColumn: null,
            targetType: "",
            modelGroup: "",
            inputColumns: null,
            otherOptions: [],
            testSplit: "",
            trainSplit: "",
            testData: "",
            trainData: "",
            filterModels: null,
            paramValues: [],
            predictionResults: "",
            viewPredictedData: false,
            showPredictionChart: false,
            chartData: {}
        };

        this.updateFeatureColumns = this.updateFeatureColumns.bind(this);
        this.updateModelParams = this.updateModelParams.bind(this);
        this.trainModel = this.trainModel.bind(this);
    }

    componentDidMount() {
        API.getFrame(this.state.expId).then((data) => {
            if (data !== 400) {
                this.setState({
                    headers: data.header,
                    prevHeaders: data.header,
                });
            }
        }).catch((err) => {
            console.log(err);
        });
    }

    updateFeatureColumns(option) {
        let objArray = [];
        let targetType = "";

        if (this.state.prevHeaders.length) {
            this.state.prevHeaders.map((value) => {
                if (value.header !== option.value) {
                    objArray.push({value: value.header, label: value.header});
                } else {
                    if (value.type === "StringType") {
                        targetType = "categorical";
                    } else {
                        targetType = "numerical";
                    }
                }
            })
        }

        this.setState({
            targetColumn: option,
            otherOptions: objArray,
            targetType: targetType
        });
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
                // "hyper_params": hyper_params,
                // "kfold": 2
            })
        }

        let group = "";

        if (option.length > 0) {
            group = option[0].group;
        }

        let new_headers = [];

        if (group === "Classification") {
            this.state.headers.map((value) => {
                if (value.type === "StringType") {
                    new_headers.push(value);
                }
            })
        } else if (group === "Regression") {
            this.state.headers.map((value) => {
                if (value.type !== "StringType") {
                    new_headers.push(value);
                }
            })
        } else {
            new_headers = this.state.prevHeaders;
        }

        this.setState({filterModels: option, paramValues: paramValues, modelGroup: group, headers: new_headers});
    }

    trainModel() {
        this.setState({loader: true});
        let featureCol = [];
        for (let key in this.state.inputColumns) {
            featureCol.push(this.state.inputColumns[key]['value'])
        }

        let modelData = {
            outputCol: this.state.targetColumn.value,
            featureCol: featureCol,
            trainSplit: this.state.trainSplit,
            testSplit: this.state.testSplit
        };


        API.prepareModel(modelData).then((data) => {
            if (data !== 400) {
                this.setState({
                    trainData: data['training_set']['docs'],
                    testData: data['testing_set']['docs'],
                    // dataHeaders: data.header,
                    prepModel: false,
                    runModel: true,
                });
                API.predictModel({outputCol: this.state.targetColumn.value, data: this.state.paramValues}).then((data) => {
                    if (data !== 400) {
                        let keys = Object.keys(data);
                        let arr = [];
                        let obj = this.state.testData;
                        let headers = this.state.headers;
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
                        let category = [];
                        let fMeasureValues = [];
                        let precisionValues = [];
                        let accuracyValues = [];
                        let recallValues = [];
                        let model_keys = Object.keys(data).sort();

                        for (let key in model_keys) {
                            category.push({"label": model_keys[key]});
                            fMeasureValues.push({"value": data[model_keys[key]]["fMeasure"]});
                            precisionValues.push({"value": data[model_keys[key]]["precision"]});
                            accuracyValues.push({"value": data[model_keys[key]]["accuracy"]});
                            recallValues.push({"value": data[model_keys[key]]["recall"]});
                        }

                        const chartData = {
                            type: 'mscolumn2d',// The chart type
                            width: '700', // Width of the chart
                            height: '400', // Height of the chart
                            dataFormat: 'json', // Data type
                            dataSource: {
                                // Chart Configuration
                                "chart": {
                                    "caption": "Prediction Visualization",
                                    // "subCaption": "In MMbbl = One Million barrels",
                                    "xAxisName": "Models",
                                    "yAxisName": "Metrics",
                                    "numberSuffix": "K",
                                    "theme": "fusion",
                                },
                                // Chart Data
                                "categories": [
                                    {
                                        "category": category
                                    }
                                ],
                                "dataset": [
                                    {
                                        "seriesname": "fMeasure",
                                        "data": fMeasureValues,
                                    },
                                    {
                                        "seriesname": "Precision",
                                        "data": precisionValues,
                                    },
                                    {
                                        "seriesname": "Accuracy",
                                        "data": accuracyValues,
                                    },
                                    {
                                        "seriesname": "Recall",
                                        "data": recallValues
                                    }
                                ],
                            }
                        };
                        this.setState({predictionResults: data, testData: obj, predictionHeaders: headers, showResults: true, showPredictionChart: true, chartData, loader: false});
                    }
                }).catch((err) => {
                    console.log(err);
                })
            }
        }).catch((err) => {
            console.log(err);
        })
    }

    renderFeatureSelection() {
        let options = [];

        if (this.state.headers.length) {
            this.state.headers.map((value) => {
                options.push({value: value.header, label: value.header});
            })
        }
        
        let classificationModels = [];
        let regressionModels = [];
        let clusteringModels = [];

        PARAMS.models.forEach((item) => {

            if (item !== "K-Means" && item !== "Bisecting K-Means" && item !== "Naive Bayes") {
                regressionModels.push({label: item, value: item, group: "Regression"});
            }
            if (item !== "K-Means" && item !== "Bisecting K-Means") {
                classificationModels.push({label: item, value: item, group: "Classification"});
            } else if (item === "K-Means" || item === "Bisecting K-Means") {
                clusteringModels.push({label: item, value: item, group: "Clustering"});
            }
        });

        let paramOptions = [
            {
                label: "Classification",
                options: classificationModels,
            },
            {
                label: "Clustering",
                options: clusteringModels
            },
            {
                label: "Regression",
                options: regressionModels
            }
        ];

        return(
            <div className={"col-md-12 no-pad bottom-pad"}>
                <div className={"col-md-12 no-pad"}>
                    <span className={"custom-h2-header"}>Model Selection</span>
                </div>
                <div className={"form-group col-md-12 no-pad medium-top-pad"}>
                    <span className={"col-md-12 no-pad medium-bottom-pad"}><strong>Models</strong></span>
                    <div className={"col-md-12 no-pad"}>
                        <Select
                            className={"col-md-4 no-pad"}
                            value={this.state.filterModels}
                            onChange={this.updateModelParams}
                            options={paramOptions}
                            isMulti
                            isSearchable
                            name={"models"}
                            classNamePrefix={"filter-options"}
                        />
                    </div>
                    {/*{this.state.filterModels ?*/}
                        {/*<p className={"col-md-4 no-pad props-helper-text medium-top-pad"}>*/}
                            {/*You have selected a {this.state.modelGroup} model and {this.state.targetType === "categorical" ?*/}
                            {/*"Classification" : "Regression"*/}
                        {/*} model will be built, which will predict the target from the classes in the selected column.*/}
                        {/*</p>*/}
                        {/*: null*/}
                    {/*}*/}
                </div>

                <hr className={"col-md-12 custom-hr"} />

                <div className={"col-md-12 no-pad"}>
                    <span className={"custom-h2-header"}>Feature Selection</span>
                </div>
                <div className={"form-group col-md-12 no-pad medium-top-pad"}>
                    <span className={"col-md-12 no-pad medium-bottom-pad"}><strong>Target Column</strong></span>
                    <div className={"col-md-12 no-pad"}>
                        <Select
                            className={"col-md-4 no-pad"}
                            value={this.state.targetColumn}
                            onChange={this.updateFeatureColumns}
                            options={options}
                            isSearchable
                            autoFocus
                            name={"columns"}
                            classNamePrefix={"filter-options"}
                        />
                    </div>
                    {this.state.targetColumn ?
                        <p className={"col-md-4 no-pad props-helper-text medium-top-pad"}>
                            The selected column is {this.state.targetType} data and a {this.state.targetType === "categorical" ?
                            "Classification" : "Regression"
                        } model will be built, which will predict the target from the classes in the selected column.
                        </p>
                        : null
                    }
                </div>
                <div className={"form-group col-md-12 no-pad medium-top-pad"}>
                    <span className={"col-md-12 no-pad medium-bottom-pad"}><strong>Input feature columns</strong></span>
                    <p className={"col-md-4 no-pad"}>
                        You can choose one or more input columns as a part of feature selection, which will be used to train the models.
                    </p>
                    <div className={"col-md-12 no-pad"}>
                        <Select
                            className={"col-md-4 no-pad"}
                            value={this.state.inputColumns}
                            onChange={(option) => this.setState({inputColumns: option})}
                            options={this.state.otherOptions}
                            isMulti
                            isSearchable
                            name={"columns"}
                            classNamePrefix={"filter-options"}
                        />
                    </div>
                </div>

                <hr className={"col-md-12 custom-hr"}/>

                <div className={"col-md-12 no-pad"}>
                    <span className={"custom-h2-header"}>Data Split</span>
                </div>
                <div className={"form-group col-md-12 no-pad medium-top-pad"}>
                    <span className={"col-md-12 no-pad medium-bottom-pad"}><strong>Train Data Split</strong></span>
                    <div className={"col-md-12 no-pad medium-bottom-pad"}>
                        <p className={"col-md-4 no-pad"}>
                            You can choose any number between 1-100. Make sure the sum of train and test split adds upto 100. Suggested number is 70.
                        </p>
                    </div>
                    <div className={"col-md-4 no-pad"}>
                        <input className={"form-control no-full-width-input input-sm"} type={"text"} onChange={(e) => this.setState({trainSplit: e.target.value})}/>
                    </div>
                </div>
                <div className={"form-group col-md-12 no-pad medium-top-pad"}>
                    <span className={"col-md-12 no-pad medium-bottom-pad"}><strong>Test Data Split</strong></span>
                    <div className={"col-md-12 no-pad medium-bottom-pad"}>
                        <p className={"col-md-4 no-pad"}>
                            You can choose any number between 1-100. Make sure the sum of train and test split adds upto 100. Suggested number is 30.
                        </p>
                    </div>
                    <div className={"col-md-4 no-pad"}>
                        <input className={"form-control no-full-width-input input-sm"} type={"text"} onChange={(e) => this.setState({testSplit: e.target.value})}/>
                    </div>
                </div>

                <div className={"col-md-12"}>
                    <button
                        className={"action-btn"}
                        type={"submit"}
                        onClick={this.trainModel}
                        disabled={(this.state.targetColumn !== null && this.state.inputColumns !== null && this.state.testSplit && this.state.trainSplit && this.state.filterModels !== null ? null : true)}
                    >
                        Train
                    </button>
                    {this.state.loader ?
                        <Loader/> : null
                    }
                </div>
            </div>
        )
    }

    renderPredictionResults() {
        return (
            <div className={"col-md-12 no-pad bottom-pad"}>
                {this.state.predictionResults ?
                    <>
                        <div className={"col-md-12 no-pad results-header medium-bottom-pad"}>
                            <span className={"go-back-icon"} onClick={() => this.setState({showResults: false})}><i className={"fas fa-arrow-left"} /></span>&nbsp;&nbsp;&nbsp;
                            <span className={"custom-h2-header"}>Training Results</span>
                        </div>
                        <div className={"col-md-12 medium-top-pad"}>
                            <button className={"action-small-btn"} onClick={() => this.setState({viewPredictedData: true})}>View Predicted Data</button>
                        </div>
                        {/*<div className={"col-md-12 no-pad top-pad prediction-div"}>*/}
                            {/*{this.state.filterModels.map((model, index) => (*/}
                                {/*<div key={index} className={"col-md-3"}>*/}
                                    {/*<h3 className={"less-margin text-center"} >{model.value}</h3>*/}
                                    {/*<div className={"col-md-12 no-pad"}>*/}
                                        {/*<label className={"col-md-4 no-pad"}>fMeasure:</label>*/}
                                        {/*<span className={"col-md-8 no-pad"}>{this.state.predictionResults[model.value.toLowerCase().split(" ").join("_")]['fMeasure']}</span>*/}
                                    {/*</div>*/}
                                    {/*<div className={"col-md-12 no-pad"}>*/}
                                        {/*<label className={"col-md-4 no-pad"}>Accuracy:</label>*/}
                                        {/*<span className={"col-md-8 no-pad"}>{this.state.predictionResults[model.value.toLowerCase().split(" ").join("_")]['accuracy']}</span>*/}
                                    {/*</div>*/}
                                    {/*<div className={"col-md-12 no-pad"}>*/}
                                        {/*<label className={"col-md-4 no-pad"}>Precision:</label>*/}
                                        {/*<span className={"col-md-8 no-pad"}>{this.state.predictionResults[model.value.toLowerCase().split(" ").join("_")]['precision']}</span>*/}
                                    {/*</div>*/}
                                    {/*<div className={"col-md-12 no-pad"}>*/}
                                        {/*<label className={"col-md-4 no-pad"}>Recall:</label>*/}
                                        {/*<span className={"col-md-8 no-pad"}>{this.state.predictionResults[model.value.toLowerCase().split(" ").join("_")]['recall']}</span>*/}
                                    {/*</div>*/}
                                {/*</div>*/}
                            {/*))}*/}
                        {/*</div>*/}
                    </>
                    : null
                }
                {this.state.showPredictionChart ?
                    <div className={"col-md-6 col-md-offset-3 no-pad"}>
                        <ReactFC {...this.state.chartData}/>
                    </div>
                     : null
                }
            </div>
        )
    }

    render() {

        let hideModal = () => this.setState({viewPredictedData: false});

        return (
            <div className={"col-md-12 no-pad"}>

                <div className={"col-md-12 content-div no-pad " + (!this.state.showResults ? "top-pad" : "medium-top-pad")}>
                    {!this.state.showResults ?
                        this.renderFeatureSelection() : null
                    }
                    {this.state.showResults ?
                        this.renderPredictionResults() : null
                    }
                    {this.state.viewPredictedData ?
                        <PredictedDataModal
                            show={this.state.viewPredictedData}
                            onHide={hideModal}
                            results={this.state.predictionResults}
                            data={this.state.testData}
                            headers={this.state.predictionHeaders}
                        />
                        : null
                    }
                </div>

            </div>
        );
    }
}

export default TrainContent;