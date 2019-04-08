import React, {Component} from 'react';
import * as API from '../api/API';

class DataSets extends Component{
    constructor(props){
        super(props);
        this.state = {
            file: '',
        }

        this.handleFileUpload = this.handleFileUpload.bind(this);
    }

    handleFileUpload(e){
        e.preventDefault();

        API.putFile(this.state.file).then((data) => {
            // console.log(data);
            localStorage.setItem('docId', data.docId)
        }).catch((err) => {
            console.log(err);
        });
    }

    render() {
        return(
            <div className={"tab-layout"}>
                <legend>Datasets</legend>
                <div className={"import-form"}>
                    <form className={"form"} onSubmit={(e) => this.handleFileUpload(e)}>
                        <div className={"form-group"}>
                        <label>Choose a file:</label>
                        <input
                            type={"file"}
                            onChange={(e) => this.setState({file: e.target.files[0]})}
                        />
                        </div>
                        <button type={"submit"} className={"btn btn-sm btn-primary"}>Upload</button>
                    </form>
                </div>
            </div>
        )
    }
}

export default DataSets;