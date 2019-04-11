import React, {Component} from 'react';
import {Modal, FormControl} from 'react-bootstrap';
import Highlight from 'react-highlight';
import Select from 'react-select';
import * as API from '../api/API';

class FilterModal extends Component{
    constructor(props){
        super(props);
        this.state = {
            filterColumns: null,
            columns: [],
            isQuery: false,
            query: ""
        };

        this.handleChange = this.handleChange.bind(this);
        this.submitFilter = this.submitFilter.bind(this);
    }


    componentDidMount() {
        // console.log('Component mounted');
        // console.log(this.props);
    }

    handleChange(option) {
        this.setState({filterColumns: option});
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
                        console.log(data);
                    }
                }).catch((err) => {
                    console.log(err);
                })
            }
        } else {
            console.log(this.state.query);
        }
    }

    renderFilterModal() {
        let options = [];

        if (this.props.headers.length) {
            this.props.headers.map((value, index) => {
                options.push({value: value, label: value});
            })
        }

        return (
            <Modal
                {...this.props}
                size={"lg"}
                aria-labelledby="contained-modal-title-vcenter"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        Apply Filters
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className={"col-md-12"}>
                    <div className={"col-md-2 filter-option-div"}>
                        <div className={(!this.state.isQuery ? "active-link" : null)} onClick={() => this.setState({isQuery: false})}>Filter by Columns</div>
                        <div className={(this.state.isQuery ? "active-link" : null)} onClick={() => this.setState({isQuery: true})}>Filter by Query</div>
                    </div>
                    {this.state.isQuery ?
                        <div className={"col-md-10"}>
                            <h4>Enter the SQL query for filtering:</h4>
                            <FormControl as={"textarea"} rows={"5"} autoFocus onChange={(e) => this.setState({query: e.target.value})} />
                        </div> :
                        <div className={"col-md-10"}>
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