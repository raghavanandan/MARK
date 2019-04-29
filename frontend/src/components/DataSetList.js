import React, {Component} from 'react';
import UploadDatasetModal from './UploadDatasetModal';
import CreateExperimentModal from './CreateExperimentModal';
// import {Loader} from './Loader';
import * as API from '../api/API';
import moment from 'moment';

class DataSetList extends Component{
    constructor(props){
        super(props);
        this.state = {
            addNew: false,
            createExperiment: false,
            docId: '',
            datasets: [],
            showAlert: false,
            loader: false,
        };

        this.handleFileUpload = this.handleFileUpload.bind(this);
        this.toggleUpload = this.toggleUpload.bind(this);
        // this.createDataframe = this.createDataframe.bind(this);
        // this.showAlert = this.showAlert.bind(this);
        this.refreshFiles = this.refreshFiles.bind(this);
    }

    componentDidMount() {
        this.refreshFiles();
    }

    // showAlert(msg) {
    //     console.log(msg);
    //     this.setState({showAlert: true}, () => console.log(this.state.showAlert));
    // }

    refreshFiles() {
        API.getFiles().then((data) => {
            if (data !== 400) {
                for (let key in data) {
                    let temp = moment(data[key]['timestamp']).format("MMM DD, YYYY");
                    data[key]['timestamp'] = temp;
                }
                this.setState({datasets: data});
            }
        }).catch((err) => {
            console.log(err);
        })
    }

    handleFileUpload(fileData){
        API.putFile(fileData).then((data) => {
            if (data !== 400) {
                localStorage.setItem('docId', data.docId);
                this.refreshFiles();
            }
        }).catch((err) => {
            console.log(err);
        });
    }

    toggleUpload() {
        this.setState({
            addNew: !this.state.addNew
        });
    }


    // createDataframe(docId) {
    //     API.createDF(docId).then((data) => {
    //         if (data !== null && data !== undefined && data !== 400) {
    //             console.log(data);
    //         }
    //     }).catch((err) => {
    //         console.log(err);
    //     });
    // }

    render() {
        let hideUploadDatasetModal = () => this.setState({addNew: false});
        let hideCreateExperimentModal = () => this.setState({createExperiment: false});

        return(
            <div className={"col-md-12 top-pad fluid-container"}>

                {/* Header */}
                <div className={"col-md-12"}>
                    <div className={"header-add-new"}>
                        <span className={"legend-heading"}>Datasets</span>
                        <span className={"add-new pull-right"} onClick={() => this.toggleUpload()}>
                            <button className={"add-new-btn"}>
                            <i className={"fas fa-plus"} />
                                &nbsp; Add new
                            </button>
                        </span>
                    </div>
                    <hr className={"legend-separator"} />
                </div>

                {/*Table*/}
                {/*{this.state.loader ? <Loader/> : null}*/}
                {this.state.datasets.length ?
                <div className={"col-md-10 table-div"}>
                    <table className={"table dataset-table"}>
                        <thead>
                            <tr>
                                <th></th>
                                <th>Name</th>
                                <th>Description</th>
                                <th>File Type</th>
                                <th>File Size</th>
                                <th>Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.datasets.map((value, index) => (
                                <tr key={index}>
                                    <td>{index+1}</td>
                                    <td className={"dataset-name"}>{value.name}</td>
                                    <td>{value.description}</td>
                                    <td>.csv</td>
                                    <td>{value.size}</td>
                                    <td>
                                        <span>{value.timestamp}</span>
                                        <span className={"pull-right table-options"} onClick={() => this.setState({createExperiment: true, docId: value.doc_id})}>
                                            Create Experiment
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div> : null }

                {/*Upload new dataset*/}
                {this.state.addNew ?
                    <UploadDatasetModal
                        show={this.state.addNew}
                        onHide={hideUploadDatasetModal}
                        onSubmit={this.handleFileUpload}
                    />
                    : null
                }

                {this.state.createExperiment ?
                    <CreateExperimentModal
                        show={this.state.createExperiment}
                        onHide={hideCreateExperimentModal}
                        doc_id={this.state.docId}
                    />
                    : null
                }
            </div>
        )
    }
}

export default DataSetList;