import React from 'react';
import {Modal} from 'react-bootstrap';

export const PredictedDataModal = (props) => {
    // console.log(props.results);
    // console.log(props.data);
    // console.log(props.headers);
    return (
        <Modal
            show={props.show}
            onHide={props.onHide}
            size={"lg"}
            className={"visualize-modal"}
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    Predicted Data
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className={""}>
                <div className={"lg-modal-content table-responsive"}>
                    <table className={"table no-margin"}>
                        <thead>
                            <tr>
                                {props.headers.map((value, index) => (
                                    <th className={""} key={index}>{value.header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                        {props.data.map((value, index) => (
                            <tr className={""} key={index}>
                                {props.headers.map((header, index) => (
                                    <td key={index}>{value[header.header]}</td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </Modal.Body>
        </Modal>
    )
};