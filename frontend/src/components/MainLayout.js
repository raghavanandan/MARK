import React, {Component} from 'react';
import HomePage from './HomePage';
import DatasetList from './DataSetList';
import ExperimentList from './ExperimentList';

class MainLayout extends Component{
    constructor(props){
        super(props);
        this.state = {
            section: '',
            expId: ''
        };

        this.loadExperiment = this.loadExperiment.bind(this);
    }

    componentDidMount() {
        this.setState({section: this.props.section});
    }

    loadExperiment(expId, expName) {
        if (expId !== "undefined") {
            this.props.history.push({
                pathname: `/experiments/${expId}`,
                state: {name: expName}
            })
        }
    }

    render() {
        let page;

        if (this.state.section === 'home') {
            page = <HomePage />
        } else if (this.state.section === 'datasets') {
            page = <DatasetList />
        } else if (this.state.section === 'experimentlist') {
            page = <ExperimentList expId={this.loadExperiment} />
        }


        return(
            <>
                {page}
            </>
        )
    }
}

export default MainLayout;