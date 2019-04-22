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
            singleStats: '',
            multiStats : '',
            expandStat: false,
            expandVis: false
        };

        this.showDetails = this.showDetails.bind(this);
        this.showScatterPlot = this.showScatterPlot.bind(this);
        this.closeModal = this.closeModal.bind(this);
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
        });
    }

    closeModal() {
        this.setState({
            chartData: '',
            scatterData: '',
            chosenColumn: '',
            optionFilter: null,
            singleStats: '',
            multiStats : ''
        });
        this.props.onHide();
    }

    showDetails(column, index) {
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
                        chartData: temp,
                        expandVis: true
                    });
                }
            }
        }).catch((err) => {
            console.log(err);
        });

        API.getStats(column).then((data) => {
           if (data !== 400) {
               let obj = {};
               for(let key in data.docs) {
                   obj[data.docs[key]['summary']] = data.docs[key][column]
               }
               this.setState({singleStats: obj, multiStats: '', expandStat: true});
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
                    scatterData: temp
                });
            }
        });

        let query = this.state.chosenColumn + ',' + option.value;

        API.getStats(query).then((data) => {
            if (data !== 400) {
                let obj = {'column1': this.state.chosenColumn, 'column2': option.value};
                for (let key in data.docs) {
                    obj[data.docs[key]['summary']] = [data.docs[key][this.state.chosenColumn], data.docs[key][option.value]];
                }
                this.setState({multiStats: obj, singleStats: ''});
            }
        }).catch((err) => {
            console.log(err);
        })
    };

    render() {
        let options = [];

        if (this.state.masterHeaders && this.state.masterHeaders.length > 0) {
            this.state.masterHeaders.map((value) => {
                if (!options.includes(value)) {
                    options.push({value: value['header'], label: value['header']});
                }
            });
        }

        if (this.state.masterHeaders) {
            return (
                <Modal
                    show={this.props.show}
                    onHide={this.closeModal}
                    size={"lg"}
                    className={"visualize-modal"}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Visualize Dataset
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className={"col-md-12 vis-modal-body"}>
                        <div className={"modal-tabs col-md-12"}>
                            <div className={(this.state.isMaster ? "tab-active" : "") + " tab-div col-md-2 text-center"}
                                 onClick={() => this.setState({isMaster: true})}>
                                <span>Master Dataframe</span>
                            </div>
                            <div className={(!this.state.isMaster ? "tab-active" : "") + " tab-div col-md-2 text-center"}
                                 onClick={() => this.setState({isMaster: false})}>
                                <span>Filtered Dataframe</span>
                            </div>
                        </div>
                        {this.state.isMaster ?
                            <div className={"col-md-6 data-table-div medium-top-pad"}>
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
                                        />
                                    </> : null}
                                <table className={"table data-table"}>
                                    <thead>
                                    <tr>
                                        {this.state.masterHeaders.map((value, index) => (
                                            <th className={"text-center"} key={index}
                                                onClick={() => this.showDetails(value['header'], index)}>{value['header']}</th>
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
                            <div className={"col-md-6 data-table-div medium-top-pad"}>
                                <table className={"table data-table"}>
                                    <thead>
                                    <tr>
                                        {this.state.filterHeaders.map((value, index) => (
                                            <th className={"text-center"} key={index}
                                                onClick={() => this.showDetails(value['header'], index)}>{value['header']}</th>
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
                        <div className={"data-table-div col-md-6 medium-top-pad"}>
                            <div className={"header-dropdown"} onClick={() => this.setState({expandStat: !this.state.expandStat})}>
                                <span><i className={"fas " + (this.state.expandStat ? "fa-angle-down" : "fa-angle-right")}/></span>&nbsp;&nbsp;&nbsp;
                                <span className={"h3-header"}>Statistics</span>
                            </div>
                            <hr className={"stat-separator"}/>
                            {this.state.expandStat ?
                                (this.state.singleStats && !this.state.multiStats ?
                                        <div className={"no-pad bottom-pad col-md-12"}>
                                    <span className={"col-md-6 text-left"}>
                                        <b>Count:</b>
                                    </span>
                                    <span className={"col-md-6 text-left"}>
                                        {this.state.singleStats.count ? this.state.singleStats.count : "-"}
                                    </span>
                                    <span className={"col-md-6 text-left"}>
                                        <b>Mean:</b>
                                    </span>
                                    <span className={"col-md-6 text-left"}>
                                        {this.state.singleStats.mean ? this.state.singleStats.mean : "-"}
                                    </span>
                                    <span className={"col-md-6 text-left"}>
                                        <b>Standard Deviation:</b>
                                    </span>
                                            <span className={"col-md-6 text-left"}>
                                        {this.state.singleStats.stddev ? this.state.singleStats.stddev: "-"}
                                    </span>
                                    <span className={"col-md-6 text-left"}>
                                        <b>Min:</b>
                                    </span>
                                    <span className={"col-md-6 text-left"}>
                                        {this.state.singleStats.min ? this.state.singleStats.min : "-"}
                                    </span>
                                    <span className={"col-md-6 text-left"}>
                                        <b>Max:</b>
                                    </span>
                                    <span className={"col-md-6 text-left"}>
                                        {this.state.singleStats.max ? this.state.singleStats.max : "-"}
                                    </span>
                                        </div> : null
                                ) : null
                            }
                            {this.state.expandStat ?
                                (this.state.multiStats && !this.state.singleStats ?
                                    <div className={"no-pad bottom-pad col-md-12"}>
                                    <span className={"col-md-3 col-md-offset-6 text-left"}>
                                        <b>{this.state.multiStats.column1}</b>
                                    </span>
                                    <span className={"col-md-3 text-left"}>
                                        <b>{this.state.multiStats.column2}</b>
                                    </span>
                                    <span className={"col-md-6 text-left"}>
                                        <b>Count:</b>
                                    </span>
                                    <span className={"col-md-3 text-left"}>
                                        {this.state.multiStats.count[0] ? this.state.multiStats.count[0] : "-"}
                                    </span>
                                    <span className={"col-md-3 text-left"}>
                                        {this.state.multiStats.count[1] ? this.state.multiStats.count[1] : "-"}
                                    </span>
                                    <span className={"col-md-6 text-left"}>
                                        <b>Mean:</b>
                                    </span>
                                    <span className={"col-md-3 text-left"}>
                                        {this.state.multiStats.mean[0] ? this.state.multiStats.mean[0] : "-"}
                                    </span>
                                    <span className={"col-md-3 text-left"}>
                                        {this.state.multiStats.mean[1] ? this.state.multiStats.mean[1] : "-"}
                                    </span>
                                    <span className={"col-md-6 text-left"}>
                                        <b>Standard Deviation:</b>
                                    </span>
                                    <span className={"col-md-3 text-left"}>
                                        {this.state.multiStats.stddev[0] ? this.state.multiStats.stddev[0] : "-"}
                                    </span>
                                     <span className={"col-md-3 text-left"}>
                                        {this.state.multiStats.stddev[1] ? this.state.multiStats.stddev[1] : "-"}
                                    </span>
                                    <span className={"col-md-6 text-left"}>
                                        <b>Min:</b>
                                    </span>
                                    <span className={"col-md-3 text-left"}>
                                        {this.state.multiStats.min[0] ? this.state.multiStats.min[0] : "-"}
                                    </span>
                                    <span className={"col-md-3 text-left"}>
                                        {this.state.multiStats.min[1] ? this.state.multiStats.min[1] : "-"}
                                    </span>
                                    <span className={"col-md-6 text-left"}>
                                        <b>Max:</b>
                                    </span>
                                    <span className={"col-md-3 text-left"}>
                                        {this.state.multiStats.max[0] ? this.state.multiStats.max[0] : "-"}
                                    </span>
                                    <span className={"col-md-3 text-left"}>
                                        {this.state.multiStats.max[1] ? this.state.multiStats.max[1] : "-"}
                                    </span>
                                        </div> : null
                                ) : null
                            }
                            <div className={"header-dropdown"} onClick={() => this.setState({expandVis: !this.state.expandVis})}>
                                <span><i className={"fas " + (this.state.expandVis ? "fa-angle-down" : "fa-angle-right")}/></span>&nbsp;&nbsp;&nbsp;
                                <span className={"h3-header"}>Visualizations</span>
                            </div>
                            <hr className={"stat-separator"}/>
                            {this.state.expandVis ?
                                <>
                                    {this.state.chartData.labels && !this.state.scatterData.labels ?
                                        <Chart chartData={this.state.chartData}/> : null}
                                    {this.state.scatterData.labels ?
                                        <ScatterPlot chartData={this.state.scatterData}/> : null}
                                </>
                                : null
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