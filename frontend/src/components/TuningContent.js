import React, {Component} from 'react';
import Select from "react-select";
import * as PARAMS from "../utils/params";
import * as API from "../api/API";

class TuningContent extends Component{
    constructor(props) {
        super(props);
        this.state = {
            expId: this.props.expId,
            targetColumn: null,
            headers: "",
            model: null,
            metric: null,
            // tuneData: {
            //     model: "",
            //     hyper_params: {},
            //     kfold: "",
            //     metric: "",
            // },
            tuneData: {},
        };

        // this.updateModels = this.updateModels.bind(this);
        this.updateParamValues = this.updateParamValues.bind(this);
        this.updateMetric = this.updateMetric.bind(this);
        this.updateModelParams = this.updateModelParams.bind(this);
        this.tuneModel = this.tuneModel.bind(this);
    }

    componentDidMount() {
        API.getFrame(this.state.expId).then((data) => {
            if (data !== 400) {
                this.setState({
                    headers: data.header
                });
            }
        }).catch((err) => {
            console.log(err);
        });
    }

    // updateModels(option) {
    //     this.setState({model: option, tuneData: {...initialTuneData, "model": option.value.toLowerCase().split(" ").join("_")}});
    // }

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
        API.predictModel({outputCol: this.state.targetColumn.value, data: this.state.tuneData}).then((data) => {
            if (data !== 400) {
                console.log(data)
            }
        }).catch((err) => {
            console.log(err);
        })
    }

    render() {
        let options = [];

        if (this.state.headers.length) {
            this.state.headers.map((value) => {
                options.push({value: value.header, label: value.header});
            })
        }

        let paramOptions = [];

        PARAMS.models.forEach((item) => {
            paramOptions.push({value: item, label: item});
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

        return(
            <div className={"col-md-12 no-pad content-div bottom-pad"}>
                <div className={"col-md-12 no-pad top-pad"}>
                    <span className={"custom-h2-header"}>Model Tuning</span>
                </div>
                <div className={"col-md-12 form-group no-pad medium-top-pad"}>
                    <div className={"col-md-12 no-pad medium-bottom-pad"}><strong>Model</strong></div>
                    <div className={"col-md-12 no-pad medium-bottom-pad"}>
                        <p className={"col-md-4 no-pad"}>
                            You can choose any model from the list below and the corresponding hyper parameters will appear for tuning.
                        </p>
                    </div>
                    <div className={"col-md-12 no-pad"}>
                        <Select
                            className={"col-md-4 no-pad"}
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
                        <hr className={"col-md-12 custom-hr"} />
                        <div className={"form-group col-md-12 no-pad "}>
                            <span className={"col-md-12 no-pad medium-bottom-pad"}><strong>Target Column</strong></span>
                            <div className={"col-md-12 no-pad"}>
                                <Select
                                    className={"col-md-4 no-pad"}
                                    value={this.state.targetColumn}
                                    onChange={(option) => this.setState({targetColumn: option})}
                                    options={options}
                                    isSearchable
                                    autoFocus
                                    name={"columns"}
                                    classNamePrefix={"filter-options"}
                                />
                            </div>
                        </div>
                        <div className={"col-md-12 no-pad form-group"}>
                            <label className={"col-md-12 no-pad"}>K-Fold</label>
                            <div className={"col-md-4 no-pad"}>
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
                                    className={"col-md-4 no-pad"}
                                    value={this.state.metric}
                                    onChange={this.updateMetric}
                                    options={metricOptions}
                                    isSearchable
                                    name={"metric"}
                                />
                            </div>
                        </div>
                        <div className={"col-md-12 form-group no-pad medium-top-pad"}>
                            <div className={"col-md-12 no-pad medium-bottom-pad"}><strong>Hyper Parameters</strong></div>
                            <div className={"col-md-12 no-pad medium-bottom-pad"}>
                                <p className={"col-md-4 no-pad"}>
                                    You can enter a single value or comma separated values for multiple values.
                                </p>
                            </div>
                            {PARAMS.hyper_params[model].map((param,index) => (
                                <div className={"col-md-12 no-pad form-group"} key={index}>
                                    <label className={"col-md-2 no-pad"}>{param.name}</label>
                                    <div className={"col-md-3 no-pad"}>
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
        )
    }
}

export default TuningContent;