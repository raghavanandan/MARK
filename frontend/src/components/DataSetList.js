import React, {Component} from 'react';
import UploadDatasetModal from './UploadDatasetModal';
import * as API from '../api/API';
import moment from 'moment';

class DataSetList extends Component{
    constructor(props){
        super(props);
        this.state = {
            addNew: false,
            datasets: [],
        };

        this.handleFileUpload = this.handleFileUpload.bind(this);
        this.toggleUpload = this.toggleUpload.bind(this);
        this.createDataframe = this.createDataframe.bind(this);
        this.refreshFiles = this.refreshFiles.bind(this);
    }

    componentDidMount() {
        this.refreshFiles();
    }

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

    createDataframe(docId) {
        API.createDF(docId).then((data) => {
            if (data !== null && data !== undefined && data !== 400) {
                console.log(data);
            }
        }).catch((err) => {
            console.log(err);
        });
    }

    render() {
        let hideUploadDatasetModal = () => this.setState({addNew: false});

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
                {this.state.datasets.length ?
                <div className={"col-md-10 table-div"}>
                    <table className={"table dataset-table"}>
                        <thead>
                            <tr>
                                <th></th>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.datasets.map((value, index) => (
                                <tr key={index}>
                                    <td>{index+1}</td>
                                    <td className={"dataset-name"}>{value.name}</td>
                                    <td>{value.description}</td>
                                    <td>
                                        <span>{value.timestamp}</span>
                                        <span className={"pull-right table-options"} onClick={() => this.createDataframe(value.doc_id)}>
                                            Create master dataframe
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
            </div>
        )
    }
}

export default DataSetList;