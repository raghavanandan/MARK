import React, {Component} from 'react';
import UploadDatasetModal from './UploadDatasetModal';
import * as API from '../api/API';

class DataSetList extends Component{
    constructor(props){
        super(props);
        this.state = {
            addNew: false,
        };

        this.handleFileUpload = this.handleFileUpload.bind(this);
        this.toggleUpload = this.toggleUpload.bind(this);
        this.createDataframe = this.createDataframe.bind(this);
    }

    handleFileUpload(fileData){
        API.putFile(fileData.file).then((data) => {
            localStorage.setItem('docId', data.docId)
        }).catch((err) => {
            console.log(err);
        });
    }

    toggleUpload() {
        this.setState({
            addNew: !this.state.addNew
        });
    }

    createDataframe() {
        let docId = localStorage.getItem('docId');
        if (docId !== "null" && docId !== "undefined") {
            API.createDF(docId).then((data) => {
                if (data !== null && data !== undefined && data !== 400) {
                    console.log('Success');
                    console.log(data);
                }
            }).catch((err) => {
                console.log(err);
            })
        }
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
                <div className={"col-md-10 table-div"}>
                    <table className={"table dataset-table"}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Created</th>
                                <th>Last Modified</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className={"dataset-name"}>biostat.csv</td>
                                <td>Apr 05, 2019</td>
                                <td>
                                    <span>Apr 06, 2019</span>
                                    <span className={"pull-right table-options"} onClick={this.createDataframe}>
                                        Create master dataframe
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

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