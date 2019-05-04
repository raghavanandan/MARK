import React, {Component} from 'react';
import {Loader} from './Loader';
import * as API from '../api/API';
import * as PARAMS from '../utils/params';

class DataContent extends Component{
    constructor(props){
        super(props);
        this.state = {
            expId: this.props.expId,
            file: [],
            headers: [],
            model_params: [],
            showColumnProps: false,
            columnName: "",
            singleColumnStats: "",
            columnType: "",
            isEdit: false,
            loader: false,
            showCustom: false,
            customValue: "",
            oldColumnName: "",
            updateLoader: false,
        };

        this.showColumnStats =  this.showColumnStats.bind(this);
        this.handleChangeReplacement = this.handleChangeReplacement.bind(this);
        this.handleUpdateColumn = this.handleUpdateColumn.bind(this);
        this.loadTable = this.loadTable.bind(this);
    }

    loadTable() {
        API.getFrame(this.state.expId).then((data) => {
            if (data !== 400) {
                this.setState({
                    file: data.docs,
                    headers: data.header
                });
            }
        }).catch((err) => {
            console.log(err);
        });
        this.setState({model_params: PARAMS.hyper_params["Decision Tree"]});
    }

    componentDidMount() {
        this.loadTable();
    }

    handleUpdateColumn() {
        this.setState({updateLoader: true});
        let data = {
            "oldColumnName": this.state.oldColumnName,
            "newColumnName": this.state.columnName,
            "value": this.state.customValue,
            "columnType": this.state.columnType
        };


        API.updateMissing(data).then((data) => {
            if (data !== 400) {
                this.loadTable();
                this.setState({updateLoader: false, singleColumnStats: ""});
            }
        }).catch((err) => {
            console.log(err);
        })
    }

    handleChangeReplacement(e) {
        let val = e.target.value;
        if (val === "custom-value") {
            this.setState({showCustom: true});
        } else {
            this.setState({customValue: val, showCustom: false});
        }
    }

    showColumnStats(column) {
        let columnType = "";
        for (let key in this.state.headers) {
            if (this.state.headers[key]["header"] === column) {
                columnType = this.state.headers[key]["type"];
            }
        }
        this.setState({showColumnProps: true, columnName: column, oldColumnName: column, isEdit: false, loader: true, columnType});
        API.getStats(column).then((data) => {
            if (data !== 400) {
                let obj = {};
                for(let key in data.docs) {
                    obj[data.docs[key]['summary']] = data.docs[key][column]
                }
                obj["unique_values"] = data.distinct_count;
                obj["missing_values"] = data.missing_count;
                obj["mode"] = data.mode;
                this.setState({singleColumnStats: obj, multiStats: '', loader: false});
            }
        }).catch((err) => {
            console.log(err);
        });
    }

    showDefaultColumnPropsMessage() {
        return(
            <div className={"default-message text-center col-md-12"}>
                <div className={"col-md-offset-2 col-md-7"}>
                    <h3>You can view and edit the properties of one or more columns of the dataset here.</h3>
                </div>
            </div>
        )
    }

    render() {
        return (
            <div className={"col-md-12 no-pad"}>
                <div className={"col-md-3 props-div no-pad top-pad"}>
                    {this.state.showColumnProps ?
                        <>
                            <div className={"col-md-12 no-pad"}>
                                <h3>Column Properties</h3>
                            </div>
                            <div className={"col-md-12 no-pad top-pad"}>
                                <div className={"form-horizontal no-pad"}>
                                    {this.state.singleColumnStats ?
                                        <>
                                            <div className={"form-group custom-form-group"}>
                                                <label className={"col-md-6 no-left-pad"}>Column:</label>
                                                <div className={"col-md-6 no-left-pad"}>
                                                    {this.state.isEdit ?
                                                        <div>
                                                            <input
                                                                className={"form-control input-sm custom-input"}
                                                                type={"text"}
                                                                value={this.state.columnName}
                                                                autoFocus={true}
                                                                onChange={(e) => this.setState({columnName: e.target.value})}
                                                            />
                                                        </div>:
                                                        <div>
                                                            <span>{this.state.columnName}</span> &nbsp;&nbsp;
                                                            <span className={"edit-icon"} onClick={() => this.setState({isEdit: true})}>
                                                        <i className={"fas fa-pen"} />
                                                    </span>
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                            <div className={"form-group custom-form-group"}>
                                                <label className={"col-md-6 no-left-pad"}>Type:</label>
                                                <div className={"col-md-6 no-left-pad"}>{this.state.columnType}</div>
                                            </div>
                                        {this.state.singleColumnStats.mean ?
                                            <div className={"form-group custom-form-group"}>
                                                <label className={"col-md-6 no-left-pad"}>Mean:</label>
                                                <div className={"col-md-6 no-left-pad"}>{this.state.singleColumnStats.mean}</div>
                                            </div> : null
                                        }
                                        {this.state.singleColumnStats.mode ?
                                            <div className={"form-group custom-form-group"}>
                                                <label className={"col-md-6 no-left-pad"}>Mode:</label>
                                                <div className={"col-md-6 no-left-pad"}>{this.state.singleColumnStats.mode}</div>
                                            </div> : null
                                        }
                                        {this.state.singleColumnStats.median ?
                                            <div className={"form-group custom-form-group"}>
                                                <label className={"col-md-6 no-left-pad"}>Median:</label>
                                                <div className={"col-md-6 no-left-pad"}>{this.state.singleColumnStats.median}</div>
                                            </div> : null
                                        }
                                        {this.state.singleColumnStats.min && !this.state.columnType === "StringType" ?
                                            <div className={"form-group custom-form-group"}>
                                                <label className={"col-md-6 no-left-pad"}>Min:</label>
                                                <div className={"col-md-6 no-left-pad"}>{this.state.singleColumnStats.min}</div>
                                            </div> : null
                                        }
                                        {this.state.singleColumnStats.max && !this.state.columnType === "StringType" ?
                                            <div className={"form-group custom-form-group"}>
                                                <label className={"col-md-6 no-left-pad"}>Max:</label>
                                                <div className={"col-md-6 no-left-pad"}>{this.state.singleColumnStats.max}</div>
                                            </div> : null
                                        }
                                        {this.state.singleColumnStats.stddev ?
                                            <div className={"form-group custom-form-group"}>
                                                <label className={"col-md-6 no-left-pad"}>Standard Deviation:</label>
                                                <div className={"col-md-6 no-left-pad"}>{this.state.singleColumnStats.stddev}</div>
                                            </div> : null
                                        }
                                            <div className={"form-group custom-form-group"}>
                                                <label className={"col-md-6 no-left-pad"}>Unique Values:</label>
                                                <div className={"col-md-6 no-left-pad"}>{this.state.singleColumnStats.unique_values}</div>
                                            </div>
                                            <div className={"form-group custom-form-group"}>
                                                <label className={"col-md-6 no-left-pad"}>Missing Values:</label>
                                                <div className={"col-md-6 no-left-pad"}>{this.state.singleColumnStats.missing_values}</div>
                                            </div>
                                            {this.state.singleColumnStats.missing_values > 0 ?
                                                <>
                                                    <div className={"form-group custom-form-group"}>
                                                        <label className={"col-md-6 no-left-pad"}>Replace missing values with:</label>
                                                        <select className={"col-md-6"} onChange={(e) => this.handleChangeReplacement(e)}>
                                                            <option>Select a value</option>
                                                            {!(this.state.columnType === "StringType") ? <option value={this.state.singleColumnStats.mean}>Mean</option> : null}
                                                            {!(this.state.columnType === "StringType") ? <option value={this.state.singleColumnStats.median}>Median</option> : null}
                                                            <option value={this.state.singleColumnStats.mode}>Mode</option>
                                                            <option value={"custom-value"}>Custom Value</option>
                                                        </select>
                                                    </div>
                                                    {this.state.showCustom ?
                                                        <div className={"form-group custom-form-group"}>
                                                            <label className={"col-md-6 no-left-pad"}>Custom Value:</label>
                                                            <div className={"col-md-6 no-left-pad"}>
                                                                <input
                                                                    className={"form-control input-sm custom-input"}
                                                                    type={"text"}
                                                                    onChange={(e) => this.setState({customValue: e.target.value})}
                                                                />
                                                            </div>
                                                        </div> : null
                                                    }
                                                </>: null
                                            }
                                            <div className={"form-group medium-top-pad"}>
                                                <button className={"action-btn"} onClick={this.handleUpdateColumn}>Update</button>
                                                {this.updateLoader ? <Loader/> : null}
                                            </div>
                                        </> : null
                                    }
                                    {this.state.loader ?
                                        <Loader/> : null
                                    }
                                </div>
                            </div>
                        </>: this.showDefaultColumnPropsMessage()
                    }
                </div>

                <div className={"col-md-9 content-div"}>
                    {this.state.file.length ?
                        <div className={"file-table table-responsive"}>
                            <table className={"table custom-table"}>
                                <thead>
                                    <tr>
                                        {this.state.headers.map((value, index) => (
                                            <th className={"dataset-column text-center"} key={index} onClick={() => this.showColumnStats(value.header)}>{value.header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                {this.state.file.map((value, index) => (
                                    <tr className={"text-center"} key={index}>
                                        {this.state.headers.map((header, index) => (
                                            <td key={index}>{value[header.header]}</td>
                                        ))}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div> : <Loader/>
                    }
                </div>
            </div>
        );
    }
}

export default DataContent;