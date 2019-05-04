const url = 'http://localhost:8080/api';

export const getFiles = () => {
    return fetch(`${url}/get-docs`)
        .then((res) => {
            if (res.status !== 200) {
                throw Error(res.statusText);
            } else {
                return res.json();
            }
        }).then((resJSON) => {
            return resJSON;
        }).catch(() => {
            return 400;
        })
};

export const getFile = (docId) => {
    return fetch(`${url}/get-doc/?docId=${docId}`)
        .then((res) => {
            if (res.status !== 200) {
                throw Error(res.statusText);
            } else {
                return res.json();
            }
        }).then((resJSON) => {
            return resJSON;
        }).catch(() => {
            return 400;
        })
};

export const putFile = (file) => {
    const data = new FormData();
    data.append('file', file.file);
    return fetch(`${url}/upload-file/?name=${file.name}&description=${file.description}`, {
        method: 'POST',
        body: data
    }).then((res) => {
        if (res.status !== 200) {
            throw Error(res.statusText);
        } else {
            return res.json();
        }
    }).then((resJSON) => {
        return resJSON;
    }).catch(() => {
        return 400;
    })
};

export const createDF = (data) => {
    const {docId, name, description} = data;
    return fetch(`${url}/create-master-df/?docId=${docId}&name=${name}&description=${description}`)
        .then((res) => {
            if (res.status !== 200) {
                throw Error(res.statusText);
            } else {
                return res.json();
            }
        }).then((resJSON) => {
          return resJSON;
        }).catch(() => {
          return 400;
        })
};

export const selectDF = (columns) => {
    return fetch(`${url}/select-df/?columns=${columns}`)
        .then((res) => {
            if (res.status !== 200) {
                throw Error(res.statusText);
            } else {
                return res.json();
            }
        }).then((resJSON) => {
            return resJSON;
        }).catch(() => {
            return 400;
        })
};

export const queryDF = (query) => {
    query = query.replace(";", "");
    let viewArr = query.split(" ");
    let viewName = viewArr[viewArr.lastIndexOf("from") + 1];
    const data = {
        rawQuery: query,
        viewName: viewName
    };
    return fetch(`${url}/filter-column`, {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(data)
        }).then((res) => {
            if (res.status !== 200) {
                throw Error(res.statusText);
            } else {
                return res.json();
            }
        }).then((resJSON) => {
                return resJSON;
            }).catch(() => {
                return 400;
            })
};

export const resetDF = () => {
    return fetch(`${url}/reset-frame`)
        .then((res) => {
            if (res.status !== 200) {
                throw Error(res.statusText);
            } else {
                return res.json();
            }
        }).then((resJSON) => {
            return resJSON;
        }).catch(() => {
            return 400;
        })
};

export const getFrame = (frameId) => {
    return fetch(`${url}/get-frame-by-id/?frameId=${frameId}`)
        .then((res) => {
            if (res.status !== 200) {
                throw Error(res.statusText);
            } else {
                return res.json();
            }
        }).then((resJSON) => {
            return resJSON;
        }).catch(() => {
            return 400;
        })
};

export const getAllFrames = () => {
    return fetch(`${url}/get-active-frames`)
        .then((res) => {
            if (res.status !== 200) {
                throw Error(res.statusText);
            } else {
                return res.json();
            }
        }).then((resJSON) => {
            return resJSON;
        }).catch(() => {
            return 400;
        })
};

export const createView = (viewName) => {
    return fetch(`${url}/create-view/?viewName=${viewName}`)
        .then((res) => {
            if (res.status !== 200) {
                throw Error(res.statusText);
            } else {
                return res.json();
            }
        }).then((resJSON) => {
            return resJSON;
        }).catch(() => {
            return 400;
        })
};

export const getColumnData = (column) => {
    return fetch(`${url}/visualizations/?column=${column}&column_type=cookie`)
        .then((res) => {
            if (res.status !== 200) {
                throw Error(res.statusText);
            } else {
                return res.json();
            }
        }).then((resJSON) => {
            return resJSON;
        }).catch(() => {
            return 400;
        })
};

export const compareColumns = (column1, column2) => {
    return fetch(`${url}/visualizations-multiple/?columns=${column1},${column2}`)
        .then((res) => {
            if (res.status !== 200) {
                throw Error(res.statusText);
            } else {
                return res.json();
            }
        }).then((resJSON) => {
            return resJSON;
        }).catch(() => {
            return 400;
        })
};

export const getStats = (column) => {
    return fetch(`${url}/statistics/?columns=${column}`)
        .then((res) => {
            if (res.status !== 200) {
                throw Error(res.statusText);
            } else {
                return res.json();
            }
        }).then((resJSON) => {
            return resJSON;
        }).catch(() => {
            return 400;
        })
};

export const prepareModel = (modelData) => {
    // console.log("Prepare Model Req", modelData);
    return fetch(`${url}/prepare-model`, {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(modelData)
        }).then((res) => {
            if (res.status !== 200) {
                throw Error(res.statusText);
            } else {
                return res.json();
            }
        }).then((resJSON) => {
                return resJSON;
            }).catch(() => {
            return 400;
        })
};

export const predictModel = (modelData) => {
    // console.log("predict Model Req", modelData);
    return fetch(`${url}/predict`, {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(modelData)
        }).then((res) => {
            if (res.status !== 200) {
                throw Error(res.statusText);
            } else {
                return res.json();
            }
        }).then((resJSON) => {
                return resJSON;
            }).catch(() => {
            return 400;
        })
};

export const updateMissing = (data) => {
    return fetch(`${url}/update-missing`, {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(data)
    }).then((res) => {
        if (res.status !== 200) {
            throw Error(res.statusText);
        } else {
            return res.json();
        }
    }).then((resJSON) => {
        return resJSON;
    }).catch(() => {
        return 400;
    })
};