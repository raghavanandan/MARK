import React from 'react';
import {Bar, Scatter} from 'react-chartjs-2';

export const Chart = (props) => {
    // console.log(props);
    return (
        <Bar
            data={props.chartData}
            options={{
                title:{
                    display: true,
                    fontSize: 25
                },
                legend:{
                    display: true,
                    position: "bottom"
                }
            }}
        />
    )
};

export const ScatterPlot = (props) => {

    return (
        <Scatter
            data={props.chartData}
            options={{
                title:{
                    display: true,
                    fontSize:25
                },
                legend:{
                    display: true,
                    position: "bottom"
                }
            }}
        />
    )
};
