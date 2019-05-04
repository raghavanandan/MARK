import React, {Component} from 'react';
import DataContent from "./DataContent";
import DatasetTable from "./DatasetTable";
import VisualizeContent from "./VisualizeContent";
import FilterContent from "./FilterContent";
import TrainContent from "./TrainContent";
import TuningContent from "./TuningContent";
import SharingContent from "./SharingContent";
// import ExperimentNavbar from "./ExperimentNavbar";

class WorkspaceLayout extends Component {
    constructor(props) {
        super(props);
        this.state = {
            expId: '',
            file: [],
            headers: [],
            showData: true,
            showVis: false,
            showFilters: false,
            showModels: false,
            showTuning: false,
            showWebService: false,
            filters: {},
            column: '',
            isExpanded: false,
        };

        this.renderWorkspace = this.renderWorkspace.bind(this);
        this.loadHeaders = this.loadHeaders.bind(this);
        this.updateFilters = this.updateFilters.bind(this);
        this.updateView = this.updateView.bind(this);
        this.loadColumnProps = this.loadColumnProps.bind(this);
        this.changeContent = this.changeContent.bind(this);
    }

    componentDidMount() {
        this.setState({
            expId: this.props.match.params.expId,
            expName: this.props.location.state.name
        })
    }

    changeContent(tab) {
        if (tab === "DATA") {
            this.setState({
                showData: true,
                showVis: false,
                showFilters: false,
                showModels: false,
                showTuning: false
            })
        } else if (tab === "VISUALIZE") {
            this.setState({
                showData: false,
                showVis: true,
                showFilters: false,
                showModels: false,
                showTuning: false,
                showWebService: false
            })
        } else if (tab === "FILTERS") {
            this.setState({
                showData: false,
                showVis: false,
                showFilters: true,
                showModels: false,
                showTuning: false,
                showWebService: false
            })
        } else if (tab === "MODELS") {
            this.setState({
                showData: false,
                showVis: false,
                showFilters: false,
                showModels: true,
                showTuning: false,
                showWebService: false
            })
        } else if (tab === "TUNING") {
            this.setState({
                showData: false,
                showVis: false,
                showFilters: false,
                showModels: false,
                showTuning: true,
                showWebService: false
            })
        } else if (tab === "WEBSERVICE") {
            this.setState({
                showData: false,
                showVis: false,
                showFilters: false,
                showModels: false,
                showTuning: false,
                showWebService: true
            })
        }
    }

    loadColumnProps(column) {
        this.setState({column});
    }

    loadHeaders(headers) {
        this.setState({headers})
    }

    updateView(option) {
        this.setState({isExpanded: option});
    }

    updateFilters(filter) {
        let headers = [];
        for (let key in filter.header) {
            headers.push(filter.header[key]['header']);
        }
        filter['header'] = headers;
        this.setState({
            filters: filter
        });
    }

    // renderWorkspace() {
    //     return (
    //         <>
    //             <DatasetTable filters={this.state.filters} column={this.loadColumnProps} expId={this.state.expId} expName={this.state.expName} updateView={this.state.isExpanded} headers={this.loadHeaders}/>
    //             {this.state.column ?
    //                 <>
    //                     {this.state.headers.length ? <ExperimentNavbar filters={this.updateFilters} columnProps={this.state.column} isExpanded={this.updateView} headers={this.state.headers}/> : null }
    //                 </> : null
    //             }
    //         </>
    //     )
    // }

    renderWorkspace() {
        return (
            <>
                <div className={"col-md-12 workspace-header fluid-container"}>
                    <span className={"exp-header"}>{this.state.expName}</span>
                </div>
                <div className={"col-md-12 workspace-nav-div no-pad"}>
                    <div className={"col-md-1 text-center workspace-nav " + (this.state.showData ? "tab-active" : "")} onClick={() => this.changeContent("DATA")}>DATA</div>
                    <div className={"col-md-1 text-center workspace-nav " + (this.state.showVis ? "tab-active" : "")} onClick={() => this.changeContent("VISUALIZE")}>VISUALIZE</div>
                    <div className={"col-md-1 text-center workspace-nav " + (this.state.showFilters ? "tab-active" : "")} onClick={() => this.changeContent("FILTERS")}>FILTERS</div>
                    <div className={"col-md-1 text-center workspace-nav " + (this.state.showModels ? "tab-active" : "")} onClick={() => this.changeContent("MODELS")}>TRAIN</div>
                    <div className={"col-md-1 text-center workspace-nav " + (this.state.showTuning ? "tab-active" : "")} onClick={() => this.changeContent("TUNING")}>TUNING</div>
                    <div className={"col-md-1 text-center workspace-nav " + (this.state.showWebService ? "tab-active" : "")} onClick={() => this.changeContent("WEBSERVICE")}>SHARE</div>
                </div>
                <div className={"col-md-12 workspace-content"}>
                    {this.state.showData ?
                        <DataContent expId={this.state.expId} />
                        : null
                    }
                    {this.state.showVis ?
                        <VisualizeContent expId={this.state.expId}/>
                        : null
                    }
                    {this.state.showFilters ?
                        <FilterContent expId={this.state.expId}/>
                        : null
                    }
                    {this.state.showModels ?
                        <TrainContent expId={this.state.expId} reset={true}/>
                        : null
                    }
                    {this.state.showTuning ?
                        <TuningContent expId={this.state.expId}/>
                        : null
                    }
                    {this.state.showWebService ?
                        <SharingContent expId={this.state.expId} /> : null
                    }
                </div>
            </>
        )
    }

    render() {
        if (this.state.filters.header !== undefined && this.state.filters.header.length > 0) {
            return (
                <>
                    <DatasetTable filters={this.state.filters} column={this.loadColumnProps} expName={this.state.expName} updateView={this.state.isExpanded} />
                    {/*{this.state.column ?*/}
                        {/*<>*/}
                            {/*{this.state.headers.length ? <ExperimentNavbar filters={this.updateFilters} columnProps={this.state.column} isExpanded={this.updateView} headers={this.state.headers}/> : null }*/}
                        {/*</> : null*/}
                    {/*}*/}
                </>
            )
        } else if (this.state.expId) {
            return this.renderWorkspace();
        } else {
            return null
        }

    }
}

export default WorkspaceLayout;