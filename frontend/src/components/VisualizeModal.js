import React, {Component} from 'react';
import {Modal} from 'react-bootstrap';
import Select from 'react-select';
import {Chart, ScatterPlot} from './Chart';
import * as API from '../api/API';

class VisualizeModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            masterData: [],
            masterHeaders: [],
            filterData: [],
            filterHeaders: [],
            isMaster: true,
            chartData: '',
            scatterData: '',
            chosenColumn: '',
            optionFilter: null,
            statistics: '',
        };

        this.showBarChart = this.showBarChart.bind(this);
        this.showScatterPlot = this.showScatterPlot.bind(this);
    }

    componentDidMount() {
        // console.log(this.props);
        API.getFrame('master').then((data) => {
            if (data !== 400) {
                this.setState({
                    masterData: data.docs,
                    masterHeaders: data.header
                });
            }
        }).catch((err) => {
            console.log(err);
        });

        API.getFrame('current').then((data) => {
            if (data !== 400) {
                this.setState({
                    filterData: data.docs,
                    filterHeaders: data.header
                });
            }
        }).catch((err) => {
            console.log(err);
        })
    }

    showBarChart(column, index) {
        // console.log(column, index);
        this.setState({chosenColumn: column});
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
                        chartData: temp
                    });
                }
            }
        }).catch((err) => {
            console.log(err);
        })
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
                    scatterData: temp
                }, () => {
                    console.log('Set', this.state.scatterData);
                });
            }
        });
    }

    render() {
        let options = [];

        if (this.state.masterHeaders && this.state.masterHeaders.length > 0) {
            this.state.masterHeaders.map((value, index) => {
                if (!options.includes(value)) {
                    options.push({value: value['header'], label: value['header']});
                }
            });
        }

        if (this.state.masterHeaders) {
            return (
                <Modal
                    show={this.props.show}
                    onHide={this.props.onHide}
                    size={"lg"}
                    className={"visualize-modal"}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Apply Filters
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className={"col-md-12 visualize-content"}>
                        <div className={"col-md-2 filter-option-div"}>
                            <div className={(this.state.isMaster ? "active-link" : null)}
                                 onClick={() => this.setState({isMaster: true})}>Load Master Dataframe
                            </div>
                            <div className={(!this.state.isMaster ? "active-link" : null)}
                                 onClick={() => this.setState({isMaster: false})}>Load Filtered Dataframe
                            </div>
                        </div>
                        {this.state.isMaster ?
                            <div className={"col-md-5 data-table-div"}>
                                {options.length && this.state.chosenColumn ?
                                    <>
                                        <div><b>Compare with:</b></div>
                                        <Select
                                            className={"compare-select"}
                                            value={this.state.optionFilter}
                                            onChange={this.showScatterPlot}
                                            options={options}
                                            isSearchable
                                            autoFocus
                                            name={"columns"}
                                            classNamePrefix={"filter-options"}
                                        /></> : null}
                                <table className={"table data-table"}>
                                    <thead>
                                    <tr>
                                        {this.state.masterHeaders.map((value, index) => (
                                            <th className={"text-center"} key={index}
                                                onClick={() => this.showBarChart(value['header'], index)}>{value['header']}</th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {this.state.masterData.map((value, index) => (
                                        <tr className={"text-center"} key={index}>
                                            {this.state.masterHeaders.map((header, index) => (
                                                <td key={index}>{value[header['header']]}</td>
                                            ))}
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div> :
                            <div className={"col-md-3 data-table-div"}>
                                <table className={"table data-table"}>
                                    <thead>
                                    <tr>
                                        {this.state.filterHeaders.map((value, index) => (
                                            <th className={"text-center"} key={index}
                                                onClick={() => this.showBarChart(value['header'], index)}>{value['header']}</th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {this.state.filterData.map((value, index) => (
                                        <tr className={"text-center"} key={index}>
                                            {this.state.filterHeaders.map((header, index) => (
                                                <td key={index}>{value[header['header']]}</td>
                                            ))}
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        }
                        <div className={"col-md-5"}>
                            <h3>Statistics</h3>
                            <hr/>
                            <h3>Visualizations</h3>
                            {this.state.chartData.labels && !this.state.scatterData.labels ?
                                <Chart chartData={this.state.chartData}/> : null
                            }
                            {this.state.scatterData.labels ?
                                <ScatterPlot chartData={this.state.scatterData} /> : null
                            }
                        </div>
                    </Modal.Body>
                    <div className={"btn-group"}>

                    </div>
                </Modal>
            )
        } else {
            return null
        }


    }
}

export default VisualizeModal;