const url = 'http://localhost:8080/api';

export const getFile = (docId) => {
    return fetch(`${url}/get-doc/?docId=${docId}`)
        .then((res) => res.json())
        .then((resJSON) => {
            return resJSON;
        }).catch((err) => {
            return 400;
        })
};

export const putFile = (file) => {
    const data = new FormData();
    data.append('file', file);
    return fetch(`${url}/upload-file`, {
        method: 'POST',
        body: data
    }).then((res) => {
        return res.json()
    }).then((resJSON) => {
        return resJSON;
    }).catch((err) => {
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
    // console.log(columns);
    return fetch(`${url}/select-df/?columns=${columns}`)
        .then((res) => res.json())
        .then((resJSON) => {
            return resJSON;
        }).catch((err) => {
            return 400;
        })
};