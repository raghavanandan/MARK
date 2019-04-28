import React, {Component} from 'react';
import {Chart, ScatterPlot} from './Chart';
// import {Loader} from './Loader';
import * as API from "../api/API";
import Select from 'react-select';
import {Loader} from "./Loader";

export default class VisualizeContent extends Component{
    constructor(props){
        super(props);
        this.state = {
            expId: this.props.expId,
            file: [],
            headers: [],
            chosenColumn: "",
            chartData: "",
            scatterData: "",
            optionFilter: null,
            errorMsg: "",
            loader: false,
        };

        this.showDetails = this.showDetails.bind(this);
        this.showScatterPlot = this.showScatterPlot.bind(this);
    }

    componentDidMount() {
        API.getFrame(this.state.expId).then((data) => {
            if (data !== 400) {
                // console.log(data);
                for(let key in data.header) {
                    let type = data.header[key]['type'];
                    if (type === "StringType") {
                        data.header[key]["type"] = "Categorical";
                    } else {
                        data.header[key]["type"] = "Numerical";
                    }
                }
                this.setState({
                    file: data.docs,
                    headers: data.header
                });
            }
        }).catch((err) => {
            console.log(err);
        });
    }

    showDetails(column) {
        this.setState({chosenColumn: column, loader: true, scatterData: "", optionFilter: ""});
        API.getColumnData(column).then((data) => {
            if (data !== 400) {
                let ndata = data.docs;
                let columns = [];
                let count = [];
                for (let key in ndata) {
                    count.push(ndata[key]['count']);
                    columns.push(ndata[key][column]);
                }
                if (columns.length > 0 && count.length > 0) {
                    let temp = {
                        labels: columns,
                        datasets: [
                            {
                                label: column,
                                data: count,
                                backgroundColor: [
                                    'rgba(255, 99, 132, 0.6)',
                                    'rgba(54, 162, 235, 0.6)',
                                    'rgba(255, 206, 86, 0.6)',
                                    'rgba(75, 192, 192, 0.6)'
                                ]
                            }
                        ]
                    };
                    this.setState({
                        chartData: temp,
                        expandVis: true,
                        errorMsg: "",
                        loader: false
                    });
                }
            } else {
                this.setState({errorMsg: "The column you selected was either not present in the filtered dataset or invalid"})
            }
        }).catch((err) => {
            console.log(err);
        });
    }

    showScatterPlot(option) {
        this.setState({optionFilter: option});
        API.compareColumns(this.state.chosenColumn, option.value).then((data) => {
            if (data !== 400) {
                let ndata = data.docs;

                let xy_array = [];
                for (let key in ndata) {

                    let obj = ndata[key];
                    let key1 = Object.keys(obj)[0];
                    let key2 = Object.keys(obj)[1];
                    obj.x = obj[key1];
                    obj.y = obj[key2];
                    delete obj[key1];
                    delete obj[key2];
                    xy_array.push(obj);
                }

                const temp = {
                    labels: ['Scatter'],
                    datasets: [
                        {
                            label: 'Scatter Plot',
                            fill: false,
                            backgroundColor: 'rgba(75,192,192,0.4)',
                            pointBorderColor: 'rgba(75,192,192,1)',
                            pointBackgroundColor: '#4d4dff',
                            pointBorderWidth: 1,
                            pointHoverRadius: 7,
                            pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                            pointHoverBorderColor: 'rgba(220,220,220,1)',
                            pointHoverBorderWidth: 2,
                            pointRadius: 7,
                            pointHitRadius: 10,
                            data: xy_array
                        }
                    ]
                };
                this.setState({
                    scatterData: temp,
                    errorMsg: ""
                });
            }
        });
    }

    render() {
        let options = [];

        if (this.state.headers && this.state.headers.length > 0) {
            this.state.headers.map((value) => {
                if (!options.includes(value)) {
                    options.push({value: value['header'], label: value['header']});
                }
                return options;
            });
        }

        return(
            <div className={"col-md-12 no-pad"}>

                <div className={"col-md-4 props-div no-pad top-pad"}>
                    <div className={"col-md-12 no-pad"}>
                        <h3>Data Columns</h3>
                    </div>
                    <div className={"file-table top-pad header-row table-responsive"}>
                        <table className={"table no-margin"}>
                            <thead>
                                <tr>
                                    <th>Columns</th>
                                    <th>Type</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                    <div className={"file-table data-rows table-responsive"}>
                        <table className={"table"}>
                            <tbody>
                            {this.state.headers.map((value, index) => (
                                <tr key={index} className={"dataset-column"} onClick={() => this.showDetails(value['header'])}>
                                    <td>{value.header}</td>
                                    <td>{value.type}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className={"col-md-8 content-div top-pad"}>
                    {this.state.errorMsg ?
                        <div className={"col-md-12 text-center alert alert-danger"}>
                            <h4>{this.state.errorMsg}</h4>
                        </div> : null
                    }
                    {this.state.chartData.labels && !this.state.scatterData.labels && !this.state.errorMsg ?
                        <>
                            <div className={"col-md-12 top-pad"}>
                                <span className={"col-md-2 no-pad"}>Compare with:</span>
                                <span className={"col-md-10 no-pad"}>
                                    <Select
                                        className={"compare-select"}
                                        value={this.state.optionFilter}
                                        onChange={this.showScatterPlot}
                                        options={options}
                                        isSearchable
                                        autoFocus
                                        name={"columns"}
                                    />
                                </span>
                            </div>
                            <Chart chartData={this.state.chartData}/>
                        </>
                        : null
                    }
                    {this.state.scatterData.labels ?
                        <>
                            <div className={"col-md-12 top-pad"}>
                                <span className={"col-md-2 no-pad"}>Compare with:</span>
                                <span className={"col-md-10 no-pad"}>
                                    <Select
                                        className={"compare-select"}
                                        value={this.state.optionFilter}
                                        onChange={this.showScatterPlot}
                                        options={options}
                                        isSearchable
                                        autoFocus
                                        name={"columns"}
                                    />
                                </span>
                            </div>
                            <ScatterPlot chartData={this.state.scatterData}/>
                        </>
                        : null
                    }
                    {this.state.loader ?
                        <Loader/> : null
                    }
                </div>
            </div>
        )
    }
}