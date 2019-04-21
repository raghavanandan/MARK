const url = 'http://localhost:8080/api';

export const getFiles = () => {
    return fetch(`${url}/get-docs`)
        .then((res) => res.json())
        .then((resJSON) => {
            return resJSON;
        }).catch(() => {
            return 400;
        })
};

export const getFile = (docId) => {
    return fetch(`${url}/get-doc/?docId=${docId}`)
        .then((res) => res.json())
        .then((resJSON) => {
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
        return res.json()
    }).then((resJSON) => {
        return resJSON;
    }).catch(() => {
        return 400;
    })
};

export const createDF = (docId) => {
  return fetch(`${url}/create-master-df/?docId=${docId}`)
      .then((res) => res.json())
      .then((resJSON) => {
          return resJSON;
      }).catch((err) => {
          return 400;
      })
};

export const selectDF = (columns) => {
    return fetch(`${url}/select-df/?columns=${columns}`)
        .then((res) => res.json())
        .then((resJSON) => {
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
    }).then((res) => res.json())
        .then((resJSON) => {
            return resJSON;
        }).catch(() => {
            return 400;
        })
};

export const resetDF = () => {
    return fetch(`${url}/reset-frame`)
        .then((res) => res.json())
        .then((resJSON) => {
            return resJSON;
        }).catch(() => {
            return 400;
        })
};

export const createView = (viewName) => {
    return fetch(`${url}/create-view/?viewName=${viewName}`)
        .then((res) => res.json())
        .then((resJSON) => {
            return resJSON;
        }).catch(() => {
            return 400;
        })
};

export const getFrame = (frametype) => {
    return fetch(`${url}/get-frame/?frame=${frametype}`)
        .then((res) => res.json())
        .then((resJSON) => {
            return resJSON;
        }).catch(() => {
            return 400;
        })
};

export const getColumnData = (column) => {
    return fetch(`${url}/visualizations/?column=${column}&column_type=cookie`)
        .then((res) => res.json())
        .then((resJSON) => {
            return resJSON;
        }).catch(() => {
            return 400;
        })
};

export const compareColumns = (column1, column2) => {
    return fetch(`${url}/visualizations-multiple/?columns=${column1},${column2}`)
        .then((res) => res.json())
        .then((resJSON) => {
            return resJSON;
        }).catch(() => {
            return 400;
        })
};

export const getStats = (column) => {
    return fetch(`${url}/statistics/?columns=${column}`)
        .then((res) => res.json())
        .then((resJSON) => {
            return resJSON;
        }).catch(() => {
            return 400;
        })
};

export const prepareModel = (modelData) => {
    return fetch(`${url}/prepare-model`, {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(modelData)
    }).then((res) => res.json())
        .then((resJSON) => {
            return resJSON;
        }).catch(() => {
        return 400;
    })
};

export const predictModel = (modelData) => {
    return fetch(`${url}/predict`, {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(modelData)
    }).then((res) => res.json())
        .then((resJSON) => {
            return resJSON;
        }).catch(() => {
        return 400;
    })
};