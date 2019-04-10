import React, {Component} from 'react';
import * as API from '../api/API';
import * as PARAMS from './params';

class DatasetTable extends Component {
    constructor(props){
        super(props);
        this.state = {
            file: [],
            headers: [],
            input_params: [],
            output_params: '',
            model: '',
            model_params: [],
            hyper_params: [],
            filter: false
        };

        this.handleInputParams = this.handleInputParams.bind(this);
        this.handleModelParams = this.handleModelParams.bind(this);
        this.handleHyperParams = this.handleHyperParams.bind(this);
        this.toggleFilterOptions = this.toggleFilterOptions.bind(this);
    }

    componentDidMount() {
        let docId = this.props.expId;
        if (docId !== "null") {
            API.getFile(docId).then((data) => {
                if (data !== null && data !== undefined) {
                    this.setState({
                        file: data.docs,
                        headers: data.header
                    });
                    this.props.headers(data.header);
                }
            }).catch((err) => {
                console.log(err);
            });
        }


        this.setState({model_params: PARAMS.hyper_params["Decision Tree"]});
    }

    handleInputParams(e){
        if(!this.state.input_params.includes(e.target.value) && this.state.input_params.length < this.state.headers.length - 1) {
            this.state.input_params.push(e.target.value);
        } else {
            let index = this.state.input_params.indexOf(e.target.value);
            if (index > -1) {
                this.state.input_params.splice(index, 1);
            }
        }
        console.log(this.state.input_params);
    }

    handleModelParams(e){
        this.setState({model_params: PARAMS.hyper_params[e.target.value], hyper_params: []});
    }

    handleHyperParams(key, value){
        let prev = {...this.state.hyper_params};
        if (!value) {
            delete prev[key];
            this.setState({hyper_params: prev}, () => console.log(this.state.hyper_params));
        } else {
            prev[key] = value;
            this.setState({hyper_params: prev}, () => console.log(this.state.hyper_params));
        }
    }

    toggleFilterOptions(){
        this.setState({
            filter: !this.state.filter
        });
    }

    render() {
        let model_params = [];
        if (this.state.model_params.length) {
            model_params = this.state.model_params;
        }

        return (
            <div className={'col-md-10 top-pad fluid-container'}>
                <div className={"col-md-12"}>
                    <div className={"header-add-new"}>
                        <span className={"legend-heading"}>Experiment - 1</span>
                    </div>
                    <hr className={"legend-separator"} />
                </div>
                {this.state.file.length ?
                    <div className={"file-table " + (this.state.filter ? "col-md-7" : "col-md-12")  + " table-responsive"}>
                        <table className={'table table-striped'}>
                            <thead>
                                <tr>
                                    {this.state.headers.map((value, index) => (
                                        <th key={index}>{value}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.file.map((value, index) => (
                                   <tr key={index}>
                                       <td>{value[this.state.headers[0]]}</td>
                                       <td>{value[this.state.headers[1]]}</td>
                                       <td>{value[this.state.headers[2]]}</td>
                                       <td>{value[this.state.headers[3]]}</td>
                                       <td>{value[this.state.headers[4]]}</td>
                                   </tr>
                                ))}
                            </tbody>
                        </table>
                    </div> : <p className={'no-file text-center'}>No file uploaded</p>}
                {this.state.filter ?
                    <div className={"col-md-5 parameter-div"}>
                        <div className={"col-md-4 input-params"}>
                            <label>Compare columns:</label>
                            <select multiple className={'params-select'} size={this.state.headers.length}>
                                {this.state.headers.map((value, index) => (
                                    <option key={index} onClick={(e) => this.handleInputParams(e)}>{value}</option>
                                ))}
                            </select>
                        </div>
                        <div className={"col-md-4 output-params"}>
                            <label>Output column:</label>
                            <select className={'params-select'} onChange={(e) => this.setState({output_params: e.target.value})}>
                                {this.state.headers.map((value, index) => (
                                    <option key={index}>{value}</option>
                                ))}
                            </select>
                        </div>
                        <div className={'col-md-4 model-list'}>
                            <label>Choose a model:</label>
                            <select className={'params-select'} onChange={(e) => this.handleModelParams(e)}>
                                {PARAMS.models.map((value, index) => (
                                    <option key={index}>{value}</option>
                                ))}
                            </select>
                        </div>
                        <div className={'col-md-12 model-params'}>
                            <div>&nbsp;</div>
                            <label>Choose hyper parameters:</label>
                            <div className={"hyper-params-div"}>
                                <table className={"table"}>
                                    <tbody>
                                    {model_params.map((value, index) => (
                                        <tr key={index}>
                                            <td>{value}</td>
                                            <td>
                                                <input
                                                    className={"form-control input-sm"}
                                                    type={"text"}
                                                    onChange={(e) => this.handleHyperParams(value, e.target.value)} />
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className={"col-md-12 text-center"}>
                            <div>&nbsp;</div>
                            <button className={"btn btn-md show-filters"}>Submit</button>
                        </div>
                    </div> : null}
            </div>
        );
    }
}

export default DatasetTable;