import React, {Component} from 'react';
import VisualizeModal from './VisualizeModal';
import FilterModal from './FilterModal';

class ExperimentNavbar extends Component{
    constructor(props){
        super(props);
        this.state = {
            showFilterModal: false,
            showVisualizeModal: false,
            filters: [],
            modalType: ''
        };

        this.toggleFilterModal = this.toggleFilterModal.bind(this);
        this.toggleVisualizeModal = this.toggleVisualizeModal.bind(this);
        this.updateFilters = this.updateFilters.bind(this);
    }

    componentDidMount() {
        // console.log(this.props.headers);
    }

    toggleFilterModal() {
        this.setState({
            showFilterModal: !this.state.showFilterModal,
        });
    }

    toggleVisualizeModal() {
        this.setState({
            showVisualizeModal: !this.state.showVisualizeModal,
        });
    }

    updateFilters(filter) {
        this.setState({
            filters: filter
        }, () => console.log(this.state));
        this.props.filters(filter);
    }

    render() {
        let hideFilterModal = () => this.setState({showFilterModal: false});
        let hideVisualizeModal = () => this.setState({showVisualizeModal: false});

        return(
            <div className={"col-md-3 exp-sidebar"}>
                <li className={"exp-links"} onClick={() => this.toggleVisualizeModal()} >
                    <i className={"fas fa-eye"} />&nbsp;&nbsp;
                    <span>Visualize Dataset</span>
                </li>
                <li className={"exp-links"} onClick={() => this.toggleFilterModal()}>
                    <i className={"fas fa-exchange-alt"} />&nbsp;&nbsp;
                    <span>Apply filters</span>
                </li>
                <VisualizeModal
                    show={this.state.showVisualizeModal}
                    onHide={hideVisualizeModal}
                />
                <FilterModal
                    show={this.state.showFilterModal}
                    onHide={hideFilterModal}
                    headers={this.props.headers}
                    filters={this.updateFilters}
                />
            </div>
        )
    }
}

export default ExperimentNavbar;