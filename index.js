// createStore(reducer, initialState, enhancer)
// { getState, dispatch, subscribe }

function createStore (reducer, initialState, enhancer) {

  if (typeof reducer !== 'function') throw new Error('reducer must be a function')

  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') throw new Error('enhancer must be a function')
    return enhancer(createStore)(reducer, initialState)
  }

  let currentState = initialState
  let callbacks = []

  function getState () {
    return currentState
  }

  function dispatch (action) {
    if (!isObject(action)) throw new Error('action must be an object')
    if (typeof action.type === 'undefined') throw new Error('action must have type prototype')
    currentState = reducer(currentState, action)
    for (let i = 0;i < callbacks.length;i++) {
      callbacks[i]()
    }
  }

  function subscribe (callback) {
    callbacks.push(callback)
  }

  return {
    getState,
    dispatch,
    subscribe
  }
}

function isObject (obj) {
  if (obj === null || typeof obj !== 'object') return false
  let proto = obj
  while (Object.getPrototypeOf(proto) != null) {
    proto = Object.getPrototypeOf(proto)
  }
  return Object.getPrototypeOf(obj) === proto
}

function applyMiddleware (...middlewares) {
  return function (createStore) {
    return function (reducer, initialState) {
      let store = createStore(reducer, initialState)
      let middlewareStore = {
        getState: store.getState,
        dispatch: store.dispatch
      }
      let firstFuncs = middlewares.map(middleware => middleware(middlewareStore))
      let _dispatch = compose(...firstFuncs)(store.dispatch)
      return {
        ...store,
        dispatch: _dispatch
      }
    }
  }
}

function compose () {
  let funcs = [...arguments]
  return function (dispatch) {
    for (let i = funcs.length - 1;i >= 0;i--) {
      dispatch = funcs[i](dispatch)
    }
    return dispatch
  }
}

function bindActionCreators (actionCreators, dispatch) {
  let obj = {}
  let keys = Object.keys(actionCreators)
  for(let i = 0;i < keys.length;i++) {
    // 此处代码需要添加 分号，否则会有语法错误
    let key = keys[i];
    (function (key) {
      obj[key] = function () {
        dispatch(actionCreators[key]())
      }
    })(key)
  }
  return obj
}

function combineReducers (reducers) {
  let keys = Object.keys(reducers)
  for (let i = 0;i < keys.length;i++) {
    if (typeof reducers[keys[i]] !== 'function') throw new Error('reducer must be a function')
  }
  return function (state, action) {
    let nextState = {}
    for (let i = 0;i < keys.length;i++) {
      let key = keys[i]
      let reducer = reducers[key]
      let preState = state[key]
      nextState[key] = reducer(preState, action)
    }
    return nextState
  }
}
