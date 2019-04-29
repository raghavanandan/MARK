import React, {Component} from 'react';
import Select from "react-select";
import * as API from "../api/API";
import {FormControl} from "react-bootstrap";
import {Loader} from "./Loader";

class FilterContent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            expId: this.props.expId,
            file: [],
            headers: [],
            filterHeaders: [],
            filterColumns: null,
            query: "",
            viewName: "",
            loader: false,
            isReset: false,
        };

        this.handleChange = this.handleChange.bind(this);
        this.submitFilterColumn = this.submitFilterColumn.bind(this);
        this.submitFilterQuery = this.submitFilterQuery.bind(this);
        this.createView = this.createView.bind(this);
        this.resetFrame = this.resetFrame.bind(this);
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

    createView() {
        this.setState({loadView: true});
        API.createView(this.state.viewName).then((data) => {
            if (data !== 400) {
                this.setState({loadView: false});
            }
        }).catch((err) => {
            console.log(err);
        })
    }

    handleChange(option) {
        this.setState({filterColumns: option});
    }

    submitFilterColumn() {
        this.setState({loader: true});
        let columns = [];
        this.state.filterColumns.forEach(function (obj) {
            columns.push(obj.value);
        });
        let filter = columns.join(',');

        if (filter.length > 0) {
            API.selectDF(filter).then((data) => {
                if (data !== 400) {
                    // console.log(data);
                    this.setState({
                        file: data.docs,
                        filterHeaders: data.header,
                        loader: false
                    })
                }
            }).catch((err) => {
                console.log(err);
            })
        }
    }

    submitFilterQuery() {
        this.setState({loader: true});
        API.queryDF(this.state.query).then((data) => {
            if (data !== 400) {
                // console.log(data);
                this.setState({
                    file: data.docs,
                    filterHeaders: data.header,
                    loader: false
                })
            }
        }).catch((err) => {
            console.log(err);
        })
    }

    resetFrame() {
        this.setState({loader: true});
        API.resetDF().then((data) => {
            if (data !== 400) {
                this.setState({
                    isReset: true,
                    file: [],
                    filterHeaders: [],
                    loader: false
                });
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
                return options;
            });
        }


        return (
            <div className={"col-md-12 no-pad"}>

                <div className={"col-md-3 props-div no-left-pad top-pad"}>
                    <div className={"col-md-12 no-pad bottom-pad"}>
                        <div className={"col-md-12 no-pad"}>
                            <h3>Filter by Columns</h3>
                        </div>
                        <div className={"col-md-12 no-pad medium-top-pad"}>
                            <p className={"props-helper-text"}>Select one or more columns from the select dropdown to
                                filter the records to only those columns.</p>
                        </div>
                        <div className={"col-md-12 no-left-pad medium-top-pad medium-bottom-pad"}>
                            <Select
                                className={""}
                                value={this.state.filterColumns}
                                onChange={this.handleChange}
                                options={options}
                                isMulti
                                isSearchable
                                autoFocus
                                name={"columns"}
                                classNamePrefix={"filter-options"}
                            />
                        </div>
                        <div className={"col-md-12 no-pad medium-top-pad"}>
                            <button className={"action-btn"}
                                    disabled={(!this.state.filterColumns ? true : null)} type={"submit"}
                                    onClick={this.submitFilterColumn}>Apply Filters
                            </button>
                        </div>

                        <hr className={"col-md-12 custom-hr"}/>

                        <div className={"col-md-12 no-pad"}>
                            <h3>Filter by Query</h3>
                        </div>
                        <div className={"col-md-12 no-pad medium-top-pad"}>
                            <p className={"props-helper-text"}>Create a view before trying out a query to filter the
                                columns from the view</p>
                        </div>
                        <div className={"col-md-12 no-left-pad medium-top-pad"}>
                            <input className={"input-sm form-control"} type={"text"}
                                   onChange={(e) => this.setState({viewName: e.target.value})}/>
                        </div>
                        <div className={"col-md-12 no-pad medium-top-pad"}>
                            <button className={"action-small-btn"} disabled={(this.state.loadView ? true : null)}
                                    type={"button"} onClick={this.createView}>Create View
                            </button>
                            {this.state.loadView ? <Loader/> : null}
                        </div>
                        <div className={"col-md-12 no-pad medium-top-pad"}>
                            <p className={"props-helper-text"}>Select one or more columns by entering an SQL query to
                                filter the records to only those columns.</p>
                        </div>
                        <div className={"col-md-12 no-left-pad medium-top-pad"}>
                            <FormControl as={"textarea"} rows={"5"}
                                         disabled={(!this.state.viewName.length ? true : null)} autoFocus
                                         onChange={(e) => this.setState({query: e.target.value})}/>
                        </div>
                        <div className={"col-md-12 no-pad medium-top-pad"}>
                            <button className={"action-btn"}
                                    disabled={(!this.state.query.length ? true : null)} type={"submit"}
                                    onClick={this.submitFilterQuery}>Apply Filters
                            </button>
                        </div>
                    </div>
                </div>

                <div className={"col-md-9 content-div"}>
                    {this.state.file.length ?
                        <>
                            <div className={"col-md-12 no-pad top-pad"}>
                                <p className={"content-helper-text"}>The dataframe or dataset has been reduced to use only the following filtered columns.
                                    To use the initial or original dataset, reset the filters.</p>
                            </div>
                            <div className={"col-md-12 no-pad medium-top-pad"}>
                                <button className={"action-small-btn"} onClick={() => this.resetFrame()}>
                                    Reset Filters
                                </button>
                            </div>
                            <div className={"file-table top-pad header-row table-responsive"}>
                                <table className={"table no-margin"}>
                                    <thead>
                                    <tr>
                                        {this.state.filterHeaders.map((value, index) => (
                                            <th className={""} key={index}>{value.header}</th>
                                        ))}
                                    </tr>
                                    </thead>
                                </table>
                            </div>
                            <div className={"file-table data-rows table-responsive"}>
                                <table className={"table"}>
                                    <tbody>
                                    {this.state.file.map((value, index) => (
                                        <tr className={""} key={index}>
                                            {this.state.filterHeaders.map((header, index) => (
                                                <td key={index}>{value[header.header]}</td>
                                            ))}
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </> : null
                    }
                    {this.state.isReset ?
                        <div className={"col-md-12 top-pad no-pad"}>
                            <h3>Dataset or dataframe has been reset to initial or original version.</h3>
                        </div> : null
                    }
                    {this.state.loader ?
                        <Loader/> : null
                    }
                </div>

            </div>
        )
    }
}

export default FilterContent;