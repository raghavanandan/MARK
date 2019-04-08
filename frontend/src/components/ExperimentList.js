import React, {Component} from 'react';
import {connect} from 'react-redux'

class ExperimentList extends Component {
    constructor(props){
        super(props);

        this.chooseExperiment = this.chooseExperiment.bind(this);
    }

    chooseExperiment(id) {
        this.props.expId(id);
    }

    render() {
        return(
            <div className={"col-md-12 top-pad fluid-container"}>
                <div className={"col-md-12"}>
                    <legend className={"legend-heading"}>Experiments</legend>
                </div>
                <div className={"col-md-10 table-div"}>
                    <table className={"table experiment-table"}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Created</th>
                                <th>Last Modified</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className={"experiment-name"} onClick={() => this.chooseExperiment('5ca45b12db954a0d80e89ddb')}>Evaluating biostat file</td>
                                <td>Apr 05, 2019</td>
                                <td>Apr 06, 2019</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}
//
// const mapStateToProps = state => {
//     // console.log('In list', state);
//     return {
//         experimentId: state.experimentId
//     };
// };
//
// const mapDispatchToProps = dispatch => {
//     return {
//         onChooseExperiment: () => dispatch({type: 'LOAD_EXPERIMENT'})
//     };
// };

// export default connect(mapStateToProps, mapDispatchToProps)(ExperimentList);
export default ExperimentList;