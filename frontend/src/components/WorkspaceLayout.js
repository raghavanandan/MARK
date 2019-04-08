import React, {Component} from 'react';
import DatasetTable from "./DatasetTable";
import ExperimentNavbar from "./ExperimentNavbar";

class WorkspaceLayout extends Component {
    constructor(props) {
        super(props);
        this.state = {
            expId: '',
            headers: []
        };

        this.renderWorkspace = this.renderWorkspace.bind(this);
        this.loadHeaders = this.loadHeaders.bind(this);
    }

    componentDidMount() {
        this.setState({expId: this.props.match.params.expId})
    }

    loadHeaders(headers) {
        this.setState({headers})
    }

    renderWorkspace() {
        if (this.state.expId) {
            return (
                <>
                    <legend className={"col-md-12 top-pad legend-heading"}>Experiment - 1</legend>
                    <DatasetTable expId={this.state.expId} headers={this.loadHeaders}/>
                    {this.state.headers.length ? <ExperimentNavbar headers={this.state.headers}/> : null }
                </>
            )
        } else {
            return null;
        }
    }

    render() {
        return this.renderWorkspace();
    }
}

export default WorkspaceLayout;