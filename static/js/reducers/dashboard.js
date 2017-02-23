// @flow
import _ from 'lodash';
import R from 'ramda';

import {
  REQUEST_DASHBOARD,
  RECEIVE_DASHBOARD_SUCCESS,
  RECEIVE_DASHBOARD_FAILURE,
  CLEAR_DASHBOARD,
  UPDATE_COURSE_STATUS,
} from '../actions/dashboard';
import {
  FETCH_FAILURE,
  FETCH_PROCESSING,
  FETCH_SUCCESS,
} from '../actions';
import type {
  DashboardsState,
  DashboardState,
} from '../flow/dashboardTypes';
import type { Action } from '../flow/reduxTypes';

export const INITIAL_DASHBOARD_STATE: DashboardState = {
  programs: []
};

const INITIAL_DASHBOARDS_STATE: DashboardsState = {};

const updateDashboardState = (state, username, update) => (
  _.merge({}, state, {[username]: update })
);

export const dashboard = (state: DashboardsState = INITIAL_DASHBOARDS_STATE, action: Action<any, string>) => {
  const { meta: username } = action;
  switch (action.type) {
  case REQUEST_DASHBOARD: // eslint-disable-line no-case-declarations
    let newBaseState = R.dissoc(username, state);
    if (action.payload === true) {
      return updateDashboardState(newBaseState, username, INITIAL_DASHBOARD_STATE);
    } else {
      return updateDashboardState(
        newBaseState,
        username,
        _.merge({}, INITIAL_DASHBOARD_STATE, { fetchStatus: FETCH_PROCESSING })
      );
    }
  case RECEIVE_DASHBOARD_SUCCESS:
    return updateDashboardState(state, username, {
      fetchStatus: FETCH_SUCCESS,
      programs: action.payload
    });
  case RECEIVE_DASHBOARD_FAILURE:
    return updateDashboardState(state, username, {
      fetchStatus: FETCH_FAILURE,
      errorInfo: action.payload,
    });
  case UPDATE_COURSE_STATUS: {
    const { courseId, status } = action.payload;
    let programs = _.cloneDeep(state[username].programs);
    for (let program of programs) {
      for (let course of program.courses) {
        for (let courseRun of course.runs) {
          if (courseRun.course_id === courseId) {
            courseRun.status = status;
          }
        }
      }
    }
    return updateDashboardState(state, username, { programs });
  }
  case CLEAR_DASHBOARD:
    return updateDashboardState(
      R.dissoc(username, state), username, INITIAL_DASHBOARD_STATE
    );
  default:
    return state;
  }
};