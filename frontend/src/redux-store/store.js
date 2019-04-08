import * as actionTypes from './action';

const redux = require('redux');
const createStore = redux.createStore;


//State
const initialState = {
    experimentId: ''
};


// Reducer
const reducer = (state = initialState, action) => {
    // console.log('Action', action);
    // console.log('Prev state', state);
    switch(action.type) {
        case actionTypes.LOAD_EXPERIMENT:
            return {
                ...state,
                experimentId: '5ca45b12db954a0d80e89ddb'
            }
    }
    return state;
};

//Store
const store = createStore(reducer);
// console.log('Store', store.getState());

export default reducer;