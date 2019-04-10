import React, {Component} from 'react';
// import ExperimentNavbar from './ExperimentNavbar';
// import * as API from "../api/API";
import ExperimentList from './ExperimentList';

class Experiment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loadDataset: false
        };

        this.loadDataset = this.loadDataset.bind(this);
    }

    componentDidMount() {
        // console.log('Experiment loaded')
    }

    // loadDataset(){
    //     this.setState({loadDataset: !this.state.loadDataset});
    // }

    render() {
        return(
            <div className={"no-pad fluid-container"}>
                <div className={"col-md-12 exp-workspace tab-layout"}>
                    <div className={"exp-name"}>
                        <legend className={"legend-heading"}>Experiments</legend>
                    </div>
                </div>
            </div>
        )
    }
}

export default Experiment;