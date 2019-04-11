import React, {Component} from 'react';
import FilterModal from './FilterModal';

class ExperimentNavbar extends Component{
    constructor(props){
        super(props);
        this.state = {
            showFilterModal: false,
            modalType: ''
        };

        this.toggleFilterModal = this.toggleFilterModal.bind(this);
    }

    componentDidMount() {
        // console.log(this.props.headers);
    }

    toggleFilterModal() {
        this.setState({
            showFilterModal: !this.state.showFilterModal,
        });
    }

    render() {
        let hideFilterModal = () => this.setState({showFilterModal: false});

        return(
            <div className={"col-md-2 exp-sidebar"}>
                {/*<li className={"exp-links"}>*/}
                    {/*<i className={"fas fa-database"} />&nbsp;&nbsp;Saved Datasets*/}
                {/*</li>*/}
                <li className={"exp-links"} onClick={() => this.toggleFilterModal()}>
                    <i className={"fas fa-exchange-alt"} />&nbsp;&nbsp;
                    <span>Apply filters</span>
                </li>
                <FilterModal
                    show={this.state.showFilterModal}
                    onHide={hideFilterModal}
                    headers={this.props.headers}
                />
            </div>
        )
    }
}

export default ExperimentNavbar;