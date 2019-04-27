import React, {Component} from 'react';
// import ColumnProps from './ColumnProps';
import VisualizeModal from './VisualizeModal';
import FilterModal from './FilterModal';
import ModelModal from './ModelModal';

class ExperimentNavbar extends Component{
    constructor(props){
        super(props);
        this.state = {
            columnProps: '',
            showFilterModal: false,
            showVisualizeModal: false,
            showModelModal: false,
            filters: [],
            modalType: '',
            isExpanded: true
        };

        this.toggleFilterModal = this.toggleFilterModal.bind(this);
        this.toggleVisualizeModal = this.toggleVisualizeModal.bind(this);
        this.toggleModelModal = this.toggleModelModal.bind(this);
        this.updateFilters = this.updateFilters.bind(this);
    }

    componentDidMount() {
        console.log(this.props.columnProps);
        this.setState({columnProps: this.props.columnProps});
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
        });
        this.props.filters(filter);
    }

    render() {
        let hideFilterModal = () => this.setState({showFilterModal: false});
        let hideVisualizeModal = () => this.setState({showVisualizeModal: false});
        let hideModelModal = () => this.setState({showModelModal: false});

        {/*<div className={(this.state.isExpanded ? "col-md-3" : "hide-exp-nav col-md-1") + " exp-sidebar"}>*/}
        return(
            <div className={"col-md-3 exp-sidebar"}>
                <div className={"hide-show-icon pull-right"} onClick={() => {
                    this.setState({isExpanded: !this.state.isExpanded}, () => this.props.isExpanded(this.state.isExpanded));
                }}>
                    {this.state.isExpanded ?
                        <i className={"fas fa-angle-double-right"}/> :
                        <i className={"fas fa-angle-double-left"}/>
                    }
                </div>
                {/*{this.state.columnProps.length ?*/}
                    {/*<ColumnProps column={this.state.columnProps} />*/}
                    {/*: null*/}
                {/*}*/}
                {/*<li className={"exp-links"} onClick={() => this.toggleVisualizeModal()} >*/}
                    {/*<i className={"fas fa-eye"} />&nbsp;&nbsp;*/}
                    {/*{this.state.isExpanded ? <span>Visualize Dataset</span> : null}*/}
                {/*</li>*/}
                {/*<li className={"exp-links"} onClick={() => this.toggleFilterModal()}>*/}
                    {/*<i className={"fas fa-exchange-alt"} />&nbsp;&nbsp;*/}
                    {/*{this.state.isExpanded ? <span>Apply filters</span> : null}*/}
                {/*</li>*/}
                {/*<li className={"exp-links"} onClick={() => this.toggleModelModal()}>*/}
                    {/*<i className={"fas fa-laptop-code"} />&nbsp;&nbsp;*/}
                    {/*{this.state.isExpanded ? <span>Model Selection</span> : null}*/}
                {/*</li>*/}
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