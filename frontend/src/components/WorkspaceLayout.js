import React, {Component} from 'react';
import DatasetTable from "./DatasetTable";
import ExperimentNavbar from "./ExperimentNavbar";

class WorkspaceLayout extends Component {
    constructor(props) {
        super(props);
        this.state = {
            expId: '',
            headers: [],
            filters: {},
            isExpanded: true,
        };

        this.renderWorkspace = this.renderWorkspace.bind(this);
        this.loadHeaders = this.loadHeaders.bind(this);
        this.updateFilters = this.updateFilters.bind(this);
        this.updateView = this.updateView.bind(this);
    }

    componentDidMount() {
        this.setState({expId: this.props.match.params.expId})
    }

    loadHeaders(headers) {
        this.setState({headers})
    }

    updateView(option) {
        this.setState({isExpanded: option}, () => console.log(this.state.isExpanded));
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

    renderWorkspace() {
        return (
            <>
                <DatasetTable filters={this.state.filters} expId={this.state.expId} updateView={this.state.isExpanded} headers={this.loadHeaders}/>
                {this.state.headers.length ? <ExperimentNavbar filters={this.updateFilters} isExpanded={this.updateView} headers={this.state.headers}/> : null }
            </>
        )
    }

    render() {
        if (this.state.filters.header !== undefined && this.state.filters.header.length > 0) {
            return (
                <>
                    <DatasetTable filters={this.state.filters} updateView={this.state.isExpanded} />
                    {this.state.headers.length ? <ExperimentNavbar filters={this.updateFilters} isExpanded={this.updateView} headers={this.state.headers}/> : null }
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