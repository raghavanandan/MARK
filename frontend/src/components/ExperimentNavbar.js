import React, {Component} from 'react';
import VisualizeModal from './VisualizeModal';
import FilterModal from './FilterModal';
import ModelModal from './ModelModal';

class ExperimentNavbar extends Component{
    constructor(props){
        super(props);
        this.state = {
            showFilterModal: false,
            showVisualizeModal: false,
            showModelModal: false,
            filters: [],
            modalType: ''
        };

        this.toggleFilterModal = this.toggleFilterModal.bind(this);
        this.toggleVisualizeModal = this.toggleVisualizeModal.bind(this);
        this.toggleModelModal = this.toggleModelModal.bind(this);
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

    toggleModelModal() {
        this.setState({
            showModelModal: !this.state.showModelModal,
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
        let hideModelModal = () => this.setState({showModelModal: false});

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
                <li className={"exp-links"} onClick={() => this.toggleModelModal()}>
                    <i className={"fas fa-laptop-code"} />&nbsp;&nbsp;
                    <span>Model Selection</span>
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
                <ModelModal
                    show={this.state.showModelModal}
                    onHide={hideModelModal}
                    headers={this.props.headers}
                />
            </div>
        )
    }
}

export default ExperimentNavbar;