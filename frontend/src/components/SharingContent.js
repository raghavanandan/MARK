import React, {Component} from 'react';
import * as API from "../api/API";

class SharingContent extends Component{
    constructor(props){
        super(props);
        this.state = {
            expId: this.props.expId,
            testAPI: false,
            file: [],
            headers: [],
            randomfile: {},
            showPrediction: false,
        };

        this.shuffleFile = this.shuffleFile.bind(this);
    }

    shuffleFile() {
        let random = Math.round(Math.random() * (this.state.file.length - 1));
        this.setState({
            randomFile: this.state.file[random]
        })
    }

    componentDidMount() {
        API.getFrame(this.state.expId).then((data) => {
            if (data !== 400) {
                let random = Math.round(Math.random() * (data.docs.length - 1));
                this.setState({
                    file: data.docs,
                    headers: data.header,
                    randomFile: data.docs[random]
                });
            }
        }).catch((err) => {
            console.log(err);
        });
    }

    render() {
        if (!this.state.testAPI) {
            return (
                <div className={"col-md-12 no-pad content-div"}>
                    <div className={"col-md-12 top-pad no-pad"}>
                        <span className={"custom-h2-header"}>Web Service created on May 3, 2019 [Adult Income Prediction]</span>
                    </div>
                    <div className={"col-md-12 top-pad"}>
                        <strong>Published Experiment</strong>
                    </div>
                    <div className={"col-md-12 medium-top-pad"}>
                        <span className={"a-link"}>Recent</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <span className={"a-link"}>View latest</span>
                    </div>
                    <div className={"col-md-12 top-pad"}>
                        <strong>Description</strong>
                    </div>
                    <div className={"col-md-12 medium-top-pad"}>
                        <div className={"col-md-5 no-pad"}>
                            <textarea className={"form-control"} rows={5} cols={10}/>
                        </div>
                    </div>
                    <div className={"col-md-12 top-pad"}>
                        <strong>API Key</strong>
                    </div>
                    <div className={"col-md-12 medium-top-pad"}>
                        <div className={"col-md-5 no-pad"}>
                            <input className={"form-control"} type={"text"} value={"MTQ1MjYzNjYzcHQxNDUyNjM2NjNwdDE0NTI2MzY2M3B0MTQ1MjYzNjYzcHQ="} disabled={true} />
                        </div>
                    </div>
                    <div className={"col-md-12 top-pad"}>
                        <strong>Default Endpoint</strong>
                    </div>
                    <div className={"col-md-7 medium-top-pad"}>
                        <table className={"table"}>
                            <thead>
                            <tr>
                                <th>API Help Page</th>
                                <th>Test</th>
                                <th>Last Updated</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td className={"api-help"}>REQUEST/RESPONSE</td>
                                <td>
                                    <button className={"action-small-btn"} onClick={() => this.setState({testAPI: true})}>Test</button>
                                </td>
                                <td className={"api-help"}>May 3, 2019 04:47 PM</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )
        } else {
            return (
                <div className={"col-md-12 no-pad"}>
                    <div className={"col-md-6 no-pad first-half-div"}>
                        <div className={"col-md-12 top-pad"}>
                            <span className={"go-back-icon right-pad"} onClick={() => this.setState({testAPI: false, showPrediction: false})}>
                                <i className={"fas fa-arrow-left"} />
                            </span>
                            <span className={"custom-h2-header"}>Input Columns</span>
                            <span>
                                <button className={"action-small-btn pull-right"} onClick={() => this.shuffleFile()}>Shuffle Data</button>
                            </span>
                        </div>
                        {this.state.headers.length ?
                            <div className={"col-md-12 top-pad"}>
                                {this.state.headers.map((value, index) => (
                                    <div className={"col-md-12 no-pad form-group"} key={index}>
                                        <label className={"col-md-5 no-pad"}>{value.header}</label>
                                        <div className={"col-md-6 no-pad"}>
                                            <input className={"input-sm form-control"} value={this.state.randomFile[value.header]} />
                                        </div>
                                    </div>
                                ))}
                            </div> : null
                        }
                        <div className={"col-md-12 top-pad"}>
                            <button className={"action-btn"} onClick={() => this.setState({showPrediction: true})}>Predict</button>
                        </div>
                    </div>
                    {this.state.showPrediction ?
                        <div className={"col-md-6 second-half-div"}>
                            <div className={"col-md-12 top-pad"}>
                                <span className={"custom-h2-header"}>Prediction Results</span>
                            </div>
                            <div className={"col-md-12 top-pad"}>
                                <label className={"col-md-5 no-pad"}>Income</label>
                                <span className={"col-md-6 no-pad"}>{this.state.randomFile.income}</span>
                            </div>
                        </div> : null
                    }
                </div>
            )
        }
    }
}

export default SharingContent;