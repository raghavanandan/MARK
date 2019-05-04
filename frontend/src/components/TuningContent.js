import React, {Component} from 'react';
import Select from "react-select";
import {Loader} from "./Loader";
import * as PARAMS from "../utils/params";
import * as API from "../api/API";

import ReactFC from 'react-fusioncharts';
import FusionCharts from 'fusioncharts';
import Column2D from 'fusioncharts/fusioncharts.charts';
import FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion';
ReactFC.fcRoot(FusionCharts, Column2D, FusionTheme);

class TuningContent extends Component{
    constructor(props) {
        super(props);
        this.state = {
            expId: this.props.expId,
            targetColumn: null,
            headers: "",
            prevHeaders: "",
            model: null,
            group: "",
            metric: null,
            inputColumns: null,
            otherOptions: [],
            fMeasure: "",
            accuracy: "",
            precision: "",
            recall: "",
            chartData: "",
            tuneData: {},
            showResults: false,
            loader: false,
            bestParams: {}
        };

        // this.updateModels = this.updateModels.bind(this);
        this.updateFeatureColumns = this.updateFeatureColumns.bind(this);
        this.filterModels = this.filterModels.bind(this);
        this.updateParamValues = this.updateParamValues.bind(this);
        this.updateMetric = this.updateMetric.bind(this);
        this.updateModelParams = this.updateModelParams.bind(this);
        this.tuneModel = this.tuneModel.bind(this);
    }

    componentDidMount() {
        API.getFrame(this.state.expId).then((data) => {
            if (data !== 400) {
                this.setState({
                    headers: data.header,
                    prevHeaders: data.header
                });
            }
        }).catch((err) => {
            console.log(err);
        });
    }

    // updateModels(option) {
    //     this.setState({model: option, tuneData: {...initialTuneData, "model": option.value.toLowerCase().split(" ").join("_")}});
    // }

    updateFeatureColumns(option) {
        let objArray = [{value: "All", label: "All"}];

        if (this.state.prevHeaders.length) {
            this.state.prevHeaders.map((value) => {
                if (value.header !== option.value) {
                    objArray.push({value: value.header, label: value.header});
                }
            });
        }

        this.setState({
            targetColumn: option,
            otherOptions: objArray,
        });
    }

    filterModels(e) {
        let objArray = [];

        this.state.prevHeaders.map((value) => {
            objArray.push({value: value.header, label: value.header});
        });
        this.setState({group: e.target.value, model: null, otherOptions: objArray});
    }

    updateMetric(option) {
        this.setState({metric: option, tuneData: {...this.state.tuneData, "metric": option.value}});
    }

    updateModelParams(option) {
        // console.log(e.target.value, type);
        // if (type !== null) {
        //     let val = "";
        //     if (parseInt(e.target.value)) {
        //         val = parseInt(e.target.value);
        //     } else {
        //         val = ""
        //     }
        //     this.setState({tuneData: {...this.state.tuneData, "kfold": val}})
        // } else {
        //     // console.log(e.target.name);
        //     this.setState({tuneData: {...this.state.tuneData, "hyper_params": {...this.state.tuneData.hyper_params, [e.target.name]: e.target.value}}})
        // }
        let paramValues = {};
        let hyper_params = {};
        let params = PARAMS['hyper_params'][option.value];

        for (let index in params) {
            hyper_params[params[index].name] = params[index].defaultValue
        }

        paramValues["model"] = option.value.toLowerCase().split(" ").join("_");
        paramValues["hyper_params"] = hyper_params;
        paramValues["kfold"] = 2;

        this.setState({tuneData: paramValues, model: option});
    }

    updateParamValues(e) {
        let prevData = this.state.tuneData;
        prevData.hyper_params[e.target.name] = e.target.value;
        this.setState({tuneData: prevData});
    }

    tuneModel() {
        this.setState({loader: true});
        console.log(this.state.tuneData);
        API.predictModel({outputCol: this.state.targetColumn.value, data: [this.state.tuneData], model: this.state.group.toLowerCase()    }).then((data) => {
            if (data !== 400) {
                let category = [];
                let fMeasureValues = [];
                let precisionValues = [];
                let accuracyValues = [];
                let recallValues = [];
                let metric_testing = [];
                let metric_training = [];
                let mseValues = [];
                let maeValues = [];
                let rmseValues = [];
                let r2Values = [];
                let chartDataSet = [];
                let key = Object.keys(data).sort();
                let props = Object.keys(data[key]);

                // console.log(data[key]["best_params"]);

                if (props.includes("mse")) {
                    mseValues.push({"value": data[key]["mse"]});
                    maeValues.push({"value": data[key]["mae"]});
                    rmseValues.push({"value": data[key]["rmse"]});
                    r2Values.push({"value": data[key]["r2"]});
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
                        },
                        {
                            "seriesname": "Best " + this.state.metric.value + " Testing",
                            "data": metric_testing
                        },
                        {
                            "seriesname": "Best " + this.state.metric.value + " Training",
                            "data": metric_training
                        }
                    ]

                } else {
                    fMeasureValues.push({"value": data[key]["fMeasure"]});
                    accuracyValues.push({"value": data[key]["accuracy"]});
                    precisionValues.push({"value": data[key]["precision"]});
                    recallValues.push({"value": data[key]["recall"]});
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
                        },
                        {
                            "seriesname": "Best " + this.state.metric.value + " Testing",
                            "data": metric_testing
                        },
                        {
                            "seriesname": "Best " + this.state.metric.value + " Training",
                            "data": metric_training
                        }
                    ]
                }

                category.push({"label": key[0]});
                metric_testing.push({"value": data[key]["hyper_tuning"]["best_metric_testing"]});
                metric_training.push({"value": data[key]["hyper_tuning"]["best_metric_training"]});

                const chartData = {
                    type: 'mscolumn2d',
                    width: '700',
                    height: '400',
                    dataFormat: 'json',
                    dataSource: {
                        // Chart Configuration
                        "chart": {
                            "caption": "Prediction Visualization",
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

                this.setState({showResults: true, chartData, loader: false, bestParams: data[key]["best_params"]}, () => console.log(this.state.bestParams))
            }
        }).catch((err) => {
            console.log(err);
        })
    }

    render() {
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

        // let paramOptions = [];
        //
        // PARAMS.models.forEach((item) => {
        //     paramOptions.push({value: item, label: item});
        // });

        // let classificationModels = [];
        // let regressionModels = [];
        // let clusteringModels = [];
        //
        // PARAMS.models.forEach((item) => {
        //
        //     if (item !== "K-Means" && item !== "Bisecting K-Means" && item !== "Naive Bayes") {
        //         regressionModels.push({label: item, value: item, group: "Regression"});
        //     }
        //     if (item !== "K-Means" && item !== "Bisecting K-Means") {
        //         classificationModels.push({label: item, value: item, group: "Classification"});
        //     } else if (item === "K-Means" || item === "Bisecting K-Means") {
        //         clusteringModels.push({label: item, value: item, group: "Clustering"});
        //     }
        // });
        //
        // let paramOptions = [
        //     {
        //         label: "Classification",
        //         options: classificationModels,
        //     },
        //     {
        //         label: "Clustering",
        //         options: clusteringModels
        //     },
        //     {
        //         label: "Regression",
        //         options: regressionModels
        //     }
        // ];

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

        let model = "";
        if (this.state.model) {
            model = this.state.model.value;
        }

        let metricOptions = [];
        metricOptions.push({value: "f1", label: "f1"});
        // metricOptions.push({value: "precision", label: "Precision"});
        metricOptions.push({value: "accuracy", label: "Accuracy"});
        // metricOptions.push({value: "recall", label: "Recall"});
        metricOptions.push({value: "weightedPrecision", label: "Weighted Precision"});
        metricOptions.push({value: "weightedRecall", label: "Weighted Recall"});

        let regressionMetrics = [];
        regressionMetrics.push({value: "mae", label: "Mean Absolute Error"});
        regressionMetrics.push({value: "mse", label: "Mean Squared Error"});
        regressionMetrics.push({value: "r2", label: "R2"});
        regressionMetrics.push({value: "rmse", label: "Root Mean Squared Error"});

        // let given_params = [];
        // if (Object.keys(this.state.tuneData).length > 0) {
        //     given_params.push(this.state.tuneData);
        // }
        //
        // console.log(given_params);

        return(
            <div className={"col-md-12 no-pad"}>

                <div className={"col-md-5 no-pad first-half-div"}>
                    <div className={"col-md-12 no-pad top-pad"}>
                        <span className={"custom-h2-header"}>Model Tuning</span>
                    </div>
                    <div className={"col-md-12 form-group no-pad medium-top-pad"}>
                        <div className={"col-md-12 no-pad medium-bottom-pad"}><strong>Model</strong></div>
                        <div className={"col-md-12 no-pad medium-bottom-pad"}>
                            <p className={"col-md-8 no-pad"}>
                                You can choose any model from the list below and the corresponding hyper parameters will appear for tuning.
                            </p>
                        </div>
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
                                value={this.state.model}
                                onChange={this.updateModelParams}
                                options={paramOptions}
                                isSearchable
                                autoFocus
                                name={"model"}
                            />
                        </div>
                    </div>
                    {this.state.model !== null ?
                        <>
                            <hr className={"col-md-11 custom-hr"} />
                            {this.state.group !== "Clustering" ?
                                <div className={"form-group col-md-12 no-pad "}>
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
                            <div className={"col-md-12 no-pad form-group"}>
                                <label className={"col-md-12 no-pad"}>K-Fold</label>
                                <div className={"col-md-8 no-pad"}>
                                    <input
                                        type={"number"}
                                        name={"kfold"}
                                        value={this.state.tuneData.kfold}
                                        className={"form-control input-sm"}
                                        placeholder={"Enter the k-fold value"}
                                        min={0}
                                        max={100}
                                        onChange={(e) => this.setState({tuneData: {...this.state.tuneData, kfold: parseInt(e.target.value)}})}
                                    />
                                </div>
                            </div>
                            <div className={"col-md-12 no-pad form-group"}>
                                <label className={"col-md-12 no-pad"}>Metric</label>
                                <div className={"col-md-12 no-pad"}>
                                    <Select
                                        className={"col-md-8 no-pad"}
                                        value={this.state.metric}
                                        onChange={this.updateMetric}
                                        options={(this.state.group !== "Regression" ? metricOptions : regressionMetrics)}
                                        isSearchable
                                        name={"metric"}
                                    />
                                </div>
                            </div>
                            <div className={"col-md-12 form-group no-pad medium-top-pad"}>
                                <div className={"col-md-12 no-pad medium-bottom-pad"}><strong>Hyper Parameters</strong></div>
                                <div className={"col-md-12 no-pad medium-bottom-pad"}>
                                    <p className={"col-md-8 no-pad"}>
                                        You can enter a single value or comma separated values for multiple values.
                                    </p>
                                </div>
                                {PARAMS.hyper_params[model].map((param,index) => (
                                    <div className={"col-md-12 no-pad form-group"} key={index}>
                                        <label className={"col-md-5 no-pad"}>{param.name}</label>
                                        <div className={"col-md-6 no-pad"}>
                                            <input
                                                type={"text"}
                                                name={param.name}
                                                value={(this.state.tuneData.hyper_params[param.name] ? this.state.tuneData.hyper_params[param.name] : "")}
                                                className={"form-control input-sm"}
                                                placeholder={"Enter comma separated values"}
                                                onChange={(e) => this.updateParamValues(e)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className={"col-md-12"}>
                                <button
                                    className={"action-btn"}
                                    type={"button"}
                                    onClick={this.tuneModel}
                                >
                                    Tune Model
                                </button>
                            </div>
                        </>
                        : null
                    }
                </div>

                <div className={"col-md-7 no-pad second-half-div"}>
                    {this.state.loader ? <Loader /> : null}
                    {this.state.showResults ?
                        <>
                            <div className={"col-md-12 top-pad"}>
                                <span className={"custom-h2-header"}>Tuning Results</span>
                            </div>
                            <div className={"col-md-12 no-pad top-pad"}>
                                <div className={"col-md-6"}>
                                    <h4>Given Parameters</h4>
                                    {model.length > 0 ?
                                        <>
                                            {PARAMS.hyper_params[model].map((param, index) => (
                                                <div className={"col-md-12 no-pad form-group"} key={index}>
                                                    <label className={"col-md-6 no-pad"}>{param.name}</label>
                                                    <span className={"col-md-6 no-pad"}>{this.state.tuneData["hyper_params"][param.name]}</span>
                                                </div>
                                            ))}
                                        </> : null
                                    }
                                </div>
                                <div className={"col-md-6"}>
                                    <h4>Best Parameters</h4>
                                    {Object.keys(this.state.bestParams).length > 0 ?
                                        <>
                                            {PARAMS.hyper_params[model].map((param, index) => (
                                                <div className={"col-md-12 no-pad form-group"} key={index}>
                                                    <label className={"col-md-6 no-pad"}>{param.name}</label>
                                                    <span className={"col-md-6 no-pad"}>{this.state.bestParams[param.name]}</span>
                                                </div>
                                            ))}
                                        </> : null
                                    }
                                </div>
                            </div>
                            <div className={"col-md-12 text-center no-pad top-pad"}>
                                <ReactFC {...this.state.chartData}/>
                            </div>
                        </>: null
                    }
                </div>
            </div>
        )
    }
}

export default TuningContent;