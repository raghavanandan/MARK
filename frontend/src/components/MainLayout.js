import React, {Component} from 'react';
import HomePage from './HomePage';
import Datasets from './DataSets';
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

    loadExperiment(expId) {
        this.props.history.push({
            pathname: `/experiments/${expId}`,
        })
    }

    render() {
        let page;

        if (this.state.section === 'home') {
            page = <HomePage />
        } else if (this.state.section === 'datasets') {
            page = <Datasets />
        } else if (this.state.section === 'experimentlist') {
            page = <ExperimentList expId={this.loadExperiment} />
        }


        return(
            <div>
                {page}
            </div>
        )
    }
}

export default MainLayout;