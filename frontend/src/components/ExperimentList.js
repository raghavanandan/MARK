import React, {Component} from 'react';
// import {connect} from 'react-redux'
import * as API from '../api/API';
import moment from 'moment';

class ExperimentList extends Component {
    constructor(props){
        super(props);
        this.state = {
            experiments: [],
        };

        this.chooseExperiment = this.chooseExperiment.bind(this);
    }

    componentDidMount() {
        // let id = localStorage.getItem('docId');
        // this.setState({expId: id});
        API.getAllFrames().then((data) => {
            if (data !== 400) {
                for (let key in data) {
                    let created_temp = moment(data[key]['created_timestamp']).format("MMM DD, YYYY");
                    let modified_temp = moment(data[key]['modified_timestamp']).format("MMM DD, YYYY");
                    data[key]['created_timestamp'] = created_temp;
                    data[key]['modified_timestamp'] = modified_temp;
                }
                this.setState({experiments: data});
            }
        }).catch((err) => {
            console.log(err);
        })
    }

    chooseExperiment(expId, expName) {
        // console.log(expId);
        this.props.expId(expId, expName);
    }

    render() {
        return(
            <div className={"col-md-12 top-pad fluid-container"}>
                <div className={"col-md-12"}>
                    <div className={"header-add-new"}>
                        <span className={"legend-heading"}>Experiments</span>
                    </div>
                    <hr className={"legend-separator"} />
                </div>
                {this.state.experiments.length ?
                    <div className={"col-md-10 table-div"}>
                        <table className={"table experiment-table"}>
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Created</th>
                                    <th>Last Modified</th>
                                </tr>
                            </thead>
                            <tbody>
                            {this.state.experiments.map((value,index) => (
                                <tr key={index} className={"experiment-row"} onClick={() => this.chooseExperiment(value.frame_id, value.name)}>
                                    <td>{index+1}</td>
                                    <td className={"experiment-name"}>{value.name}</td>
                                    <td>{value.description}</td>
                                    <td>{value.created_timestamp}</td>
                                    <td>{value.modified_timestamp}</td>
                                </tr>
                            ))}
                                {/*<tr className={"experiment-row"} onClick={() => this.chooseExperiment("Evaluating adult_income file")}>*/}
                                    {/*<td>1</td>*/}
                                    {/*<td className={"experiment-name"}>Evaluating adult_income file</td>*/}
                                    {/*<td>Apr 05, 2019</td>*/}
                                    {/*<td>Apr 06, 2019</td>*/}
                                {/*</tr>*/}
                            </tbody>
                        </table>
                    </div> : null
                }
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