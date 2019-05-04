import React, {Component} from 'react';
import Select from "react-select";
import * as API from "../api/API";
import {Loader} from "./Loader";
import {PredictedDataModal} from "./PredictedDataModal";
import * as PARAMS from "../utils/params";

import ReactFC from 'react-fusioncharts';
import ReactFusioncharts from "react-fusioncharts";
import FusionCharts from 'fusioncharts';
import charts from "fusioncharts/fusioncharts.charts";
import Column2D from 'fusioncharts/fusioncharts.charts';
import FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion';
ReactFC.fcRoot(FusionCharts, Column2D, FusionTheme);

charts(FusionCharts);

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
            group: "",
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
            chartData: {},
            roc_data: []
        };

        this.filterModels = this.filterModels.bind(this);
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
        let objArray = [{value: "All", label: "All"}];
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
            });
        }

        this.setState({
            targetColumn: option,
            otherOptions: objArray,
            targetType: targetType
        });
    }

    filterModels(e) {
        let objArray = [];

        this.state.prevHeaders.map((value) => {
           objArray.push({value: value.header, label: value.header});
        });
        this.setState({group: e.target.value, otherOptions: objArray, filterModels: null});
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

        let new_headers = this.state.prevHeaders;

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

        // console.log(new_headers);

        this.setState({filterModels: option, paramValues: paramValues, modelGroup: group, headers: new_headers});
    }

    trainModel() {
        this.setState({loader: true});
        let featureCol = [];
        let outputCol = "";
        for (let key in this.state.inputColumns) {
            featureCol.push(this.state.inputColumns[key]['value'])
        }

        if (this.state.group === "Clustering") {
            outputCol = "";
        } else {
            outputCol = this.state.targetColumn.value;
        }

        let modelData = {
            outputCol: outputCol,
            featureCol: featureCol,
            trainSplit: this.state.trainSplit,
            testSplit: this.state.testSplit,
            model: this.state.group.toLowerCase()
        };

        API.prepareModel(modelData).then((data) => {
            if (data !== 400) {
                // console.log("Prepare Model", data);
                this.setState({
                    trainData: data['training_set']['docs'],
                    testData: data['testing_set']['docs'],
                    // dataHeaders: data.header,
                    prepModel: false,
                    runModel: true,
                });

                API.predictModel({outputCol: this.state.targetColumn.value, data: this.state.paramValues, model: this.state.group.toLowerCase()}).then((data) => {
                    if (data !== 400) {
                        // console.log(data);
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
                        let mseValues = [];
                        let maeValues = [];
                        let rmseValues = [];
                        let r2Values = [];
                        let chartDataSet = [];
                        let roc_data = [];
                        let model_keys = Object.keys(data).sort();

                        for (let key in model_keys) {
                            if (model_keys[key] === "logistic_regression") {
                                roc_data = model_keys[key]["roc_data"];
                                roc_data = {
                                    chart: {
                                        caption: "ROC Curve",
                                        yaxisname: "TPR",
                                        xaxisname: "FPR",
                                        legendposition: "Right",
                                        drawanchors: "0",
                                        showvalues: "0",
                                        plottooltext: "<b>$dataValue</b>",
                                        theme: "fusion"
                                    },
                                    data: data[model_keys[key]]["roc_data"]["docs"]
                                };
                            }

                            if (this.state.group === "Regression") {
                                mseValues.push({"value": data[model_keys[key]]["mse"]});
                                maeValues.push({"value": data[model_keys[key]]["mae"]});
                                rmseValues.push({"value": data[model_keys[key]]["rmse"]});
                                r2Values.push({"value": data[model_keys[key]]["r2"]});
                                chartDataSet = [
                                    {
                                        "seriesname": "mse",
                                        "data": mseValues,
                                    },
                                    {
                                        "seriesname": "mae",
                                        "data": maeValues,
                                    },
                                    {
                                        "seriesname": "rmse",
                                        "data": rmseValues,
                                    },
                                    {
                                        "seriesname": "r2",
                                        "data": r2Values
                                    }
                                ]
                            } else {
                                fMeasureValues.push({"value": data[model_keys[key]]["fMeasure"]});
                                precisionValues.push({"value": data[model_keys[key]]["precision"]});
                                accuracyValues.push({"value": data[model_keys[key]]["accuracy"]});
                                recallValues.push({"value": data[model_keys[key]]["recall"]});
                                chartDataSet = [
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
                                ]
                            }
                            category.push({"label": model_keys[key]});
                        }

                        // console.log(chartDataSet);

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
                                "dataset": chartDataSet,
                            }
                        };
                        this.setState({
                            predictionResults: data,
                            testData: obj,
                            predictionHeaders: headers,
                            showResults: true,
                            showPredictionChart: true,
                            chartData,
                            loader: false,
                            roc_data
                        });
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
                if (this.state.group === "Regression") {
                    if (value.type !== "StringType") {
                        options.push({value: value.header, label: value.header});
                    }
                } else {
                    options.push({value: value.header, label: value.header});
                }
            });
        }

        let paramOptions = [];

        PARAMS.models.forEach((item) => {
            if (this.state.group === "Classification") {
                if (item !== "K-Means" && item !== "Bisecting K-Means" && item !== "Linear Regression") {
                    paramOptions.push({value: item, label: item});
                }
            } else if (this.state.group === "Regression") {
                if (item !== "Naive Bayes" && item !== "K-Means" && item !== "Bisecting K-Means" && item !== "Logistic Regression") {
                    paramOptions.push({value: item, label: item});
                }
            } else if (this.state.group === "Clustering") {
                if (item === "K-Means" || item === "Bisecting K-Means") {
                    paramOptions.push({value: item, label: item});
                }
            }
        });


        return(
            <div className={"col-md-12 no-pad"}>
                <div className={"col-md-12 no-pad"}>
                    <span className={"custom-h2-header"}>Model Selection</span>
                </div>
                <div className={"form-group col-md-12 no-pad medium-top-pad"}>
                    <span className={"col-md-12 no-pad medium-bottom-pad"}><strong>Models</strong></span>
                    <div className={"col-md-12 no-pad"}>
                        <span className={"col-md-3 no-pad"}>
                            <label className={"radio-inline"}>
                                <input
                                    className={""}
                                    type={"radio"}
                                    name={"type"}
                                    value={"Classification"}
                                    onChange={(e) => this.filterModels(e)}
                                />Classification
                            </label>
                        </span>
                        <span className={"col-md-3 no-pad"}>
                            <label className={"radio-inline"}>
                                <input
                                    className={""}
                                    type={"radio"}
                                    name={"type"}
                                    value={"Clustering"}
                                    onChange={(e) => this.filterModels(e)}
                                />Clustering
                            </label>
                        </span>
                        <span className={"col-md-3 no-pad"}>
                            <label className={"radio-inline"}>
                                <input
                                    className={""}
                                    type={"radio"}
                                    name={"type"}
                                    value={"Regression"}
                                    onChange={(e) => this.filterModels(e)}
                                />Regression
                            </label>
                        </span>
                    </div>
                    <div className={"col-md-12 no-pad medium-top-pad"}>
                        <Select
                            className={"col-md-8 no-pad"}
                            value={this.state.filterModels}
                            onChange={this.updateModelParams}
                            options={paramOptions}
                            isMulti
                            isSearchable
                            autoFocus
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
                {this.state.group !== "Clustering" ?
                    <div className={"form-group col-md-12 no-pad medium-top-pad"}>
                        <span className={"col-md-12 no-pad medium-bottom-pad"}><strong>Target Column</strong></span>
                        <div className={"col-md-12 no-pad"}>
                            <Select
                                className={"col-md-8 no-pad"}
                                value={this.state.targetColumn}
                                onChange={this.updateFeatureColumns}
                                options={options}
                                isSearchable
                                name={"columns"}
                                classNamePrefix={"filter-options"}
                            />
                        </div>
                        {this.state.targetColumn ?
                            <p className={"col-md-8 no-pad props-helper-text medium-top-pad"}>
                                The selected column is {this.state.targetType} data and a {this.state.targetType === "categorical" ?
                                "Classification" : "Regression"
                            } model will be built, which will predict the target from the classes in the selected column.
                            </p>
                            : null
                        }
                    </div> : null
                }
                <div className={"form-group col-md-12 no-pad medium-top-pad"}>
                    <span className={"col-md-12 no-pad medium-bottom-pad"}><strong>Input feature columns</strong></span>
                    <p className={"col-md-8 no-pad"}>
                        You can choose one or more input columns as a part of feature selection, which will be used to train the models.
                    </p>
                    <div className={"col-md-12 no-pad"}>
                        <Select
                            className={"col-md-8 no-pad"}
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
                        <p className={"col-md-8 no-pad"}>
                            You can choose any number between 1-100. Make sure the sum of train and test split adds upto 100. Suggested number is 70.
                        </p>
                    </div>
                    <div className={"col-md-8 no-pad"}>
                        <input className={"form-control no-full-width-input input-sm"} type={"text"} onChange={(e) => this.setState({trainSplit: e.target.value})}/>
                    </div>
                </div>
                <div className={"form-group col-md-12 no-pad medium-top-pad"}>
                    <span className={"col-md-12 no-pad medium-bottom-pad"}><strong>Test Data Split</strong></span>
                    <div className={"col-md-12 no-pad medium-bottom-pad"}>
                        <p className={"col-md-8 no-pad"}>
                            You can choose any number between 1-100. Make sure the sum of train and test split adds upto 100. Suggested number is 30.
                        </p>
                    </div>
                    <div className={"col-md-8 no-pad"}>
                        <input className={"form-control no-full-width-input input-sm"} type={"text"} onChange={(e) => this.setState({testSplit: e.target.value})}/>
                    </div>
                </div>

                <div className={"col-md-12"}>
                    <button
                        className={"action-btn"}
                        type={"submit"}
                        onClick={this.trainModel}
                    >
                        Train
                    </button>
                </div>
            </div>
        )
    }

    renderPredictionResults() {
        return (
            <div className={"col-md-12 no-pad bottom-pad"}>
                {this.state.predictionResults ?
                    <>
                        <div className={"col-md-12"}>
                            {/*<span className={"go-back-icon"} onClick={() => this.setState({showResults: false})}><i className={"fas fa-arrow-left"} /></span>&nbsp;&nbsp;&nbsp;*/}
                            <span className={"custom-h2-header"}>Training Results</span>
                        </div>
                        <div className={"col-md-12 top-pad"}>
                            <button className={"action-small-btn"} onClick={() => this.setState({viewPredictedData: true})}>View Predicted Data</button>
                        </div>
                    </>
                    : null
                }
                {this.state.showPredictionChart ?
                    <div className={"col-md-12 no-pad top-pad"}>
                        <ReactFC {...this.state.chartData}/>
                        {Object.keys(this.state.roc_data).length > 0 ?
                            <ReactFusioncharts
                                type="line"
                                width="100%"
                                height="100%"
                                dataFormat="JSON"
                                dataSource={this.state.roc_data}
                            /> : null
                        }
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

                <div className={"col-md-12 no-pad top-pad"}>
                    <div className={"col-md-5 no-pad first-half-div"}>
                        {this.renderFeatureSelection()}
                    </div>
                    <div className={"col-md-7 no-pad second-half-div"}>
                        {this.state.loader ?
                            <Loader/> : null
                        }
                        {this.renderPredictionResults()}
                    </div>
                    {/*{!this.state.showResults ?*/}
                    {/*    this.renderFeatureSelection() : null*/}
                    {/*}*/}
                    {/*{this.state.showResults ?*/}
                    {/*    this.renderPredictionResults() : null*/}
                    {/*}*/}
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