import React, {Component} from 'react';
import {Button, Modal} from 'react-bootstrap';
import Select from 'react-select';

class FilterModal extends Component{
    constructor(props){
        super(props);
        this.state = {
            filterColumns: [],
        }
    }


    componentDidMount() {
        // console.log('Component mounted');
        // console.log(this.props);
    }

    handleChange(option) {
        console.log(option);
    }

    renderFilterModal() {
        let options = [

        ];

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
                <Modal.Body>
                    <h4>Choose the columns:</h4>
                        <Select
                            className={"filter-select"}
                            value={null}
                            onChange={this.handleChange}
                            options={options}
                            isMulti={true}
                        />
                        {/*<select>*/}
                            {/*{this.props.headers.map((value, index) => (*/}
                                {/*<option key={index}>{value}</option>*/}
                            {/*))}*/}
                        {/*</select>*/}
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.onHide}>Close</Button>
                </Modal.Footer>
            </Modal>
        )
    }

    render() {
        return this.renderFilterModal();
    }
}

export default FilterModal;