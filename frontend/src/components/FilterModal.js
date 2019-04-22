import React, {Component} from 'react';
import {Modal, FormControl} from 'react-bootstrap';
import Select from 'react-select';
import * as API from '../api/API';

class FilterModal extends Component{
    constructor(props){
        super(props);
        this.state = {
            filterColumns: null,
            columns: [],
            isQuery: false,
            query: "",
            viewName: ""
        };

        this.handleChange = this.handleChange.bind(this);
        this.submitFilter = this.submitFilter.bind(this);
        this.createView = this.createView.bind(this);
    }


    componentDidMount() {
        // console.log('Component mounted');
        // console.log(this.props);
    }

    handleChange(option) {
        this.setState({filterColumns: option});
    }

    createView() {
        API.createView(this.state.viewName).then((data) => {
            if (data !== 400) {
                console.log(data);
            }
        }).catch((err) => {
            console.log(err);
        })
    }

    submitFilter() {
        if (!this.state.isQuery) {
            let columns = [];
            this.state.filterColumns.forEach(function (obj) {
                columns.push(obj.value);
            });
            let filter = columns.join(',');

            if (filter.length > 0) {
                API.selectDF(filter).then((data) => {
                    if (data !== undefined && data!= null && data !== 400) {
                        this.props.filters(data);
                        this.props.onHide();
                    }
                }).catch((err) => {
                    console.log(err);
                })
            }
        } else {
            API.queryDF(this.state.query).then((data) => {
                if (data !== 400) {
                    // console.log(data);
                    this.props.filters(data);
                    this.props.onHide();
                }
            }).catch((err) => {
                console.log(err);
            })
        }
    }

    renderFilterModal() {
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
                aria-labelledby="contained-modal-title-vcenter"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        Apply Filters
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className={"col-md-12 filter-modal-body"}>
                    <div className={"modal-tabs col-md-12"}>
                        <div className={(!this.state.isQuery ? "tab-active" : "") + " tab-div col-md-2 text-center"}
                             onClick={() => this.setState({isQuery: false})}>
                            <span>Filter by Columns</span>
                        </div>
                        <div className={(this.state.isQuery ? "tab-active" : "") + " tab-div col-md-2 text-center"}
                             onClick={() => this.setState({isQuery: true})}>
                            <span>Filter by Query</span>
                        </div>
                    </div>
                    {this.state.isQuery ?
                        <div className={"col-md-12 top-pad"}>
                            <span className={"col-md-3 right-pad"}>
                                <input className={"input-sm form-control"} type={"text"} onChange={(e) => this.setState({viewName: e.target.value})} />
                            </span>
                            <span>
                                <button className={"action-small-btn"} type={"button"} onClick={this.createView}>Create View</button>
                            </span>
                            <h4>Enter the SQL query for filtering:</h4>
                            <FormControl as={"textarea"} rows={"5"} autoFocus onChange={(e) => this.setState({query: e.target.value})} />
                        </div> :
                        <div className={"col-md-12 top-pad"}>
                            <h4>Choose the columns:</h4>
                            <Select
                                className={"filter-select"}
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
                    }
                </Modal.Body>
                <div className={"btn-group"}>
                    <button className={"action-btn pull-right"} type={"submit"} onClick={this.submitFilter}>Submit</button>
                    <button className={'cancel-btn pull-right'} onClick={this.props.onHide}>Cancel</button>
                </div>
            </Modal>
        )
    }

    render() {
        return this.renderFilterModal();
    }
}

export default FilterModal;