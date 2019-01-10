/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import produce from 'immer';
import { handleActions } from 'redux-actions';
import {
  loadStatus,
  loadStatusFailed,
  loadStatusSuccess,
  updateCloneProgress,
  updateDeleteProgress,
  updateIndexProgress,
} from '../actions/status';

export enum RepoState {
  CLONING,
  DELETING,
  INDEXING,
  READY,
}

export interface RepoStatus {
  state: RepoState;
  progress?: number;
  cloneProgress?: any;
}

export interface StatusState {
  status: { [key: string]: RepoStatus };
  loading: boolean;
  error?: Error;
}

const initialState: StatusState = {
  status: {},
  loading: false,
};

export const status = handleActions(
  {
    [String(loadStatus)]: (state: StatusState) =>
      produce<StatusState>(state, draft => {
        draft.loading = true;
      }),
    [String(loadStatusSuccess)]: (state: StatusState, action: any) =>
      produce<StatusState>(state, draft => {
        draft.status[action.payload.repoUri] = {
          ...action.payload.status,
          state: RepoState.READY,
        };
        draft.loading = false;
      }),
    [String(loadStatusFailed)]: (state: StatusState, action: any) =>
      produce<StatusState>(state, draft => {
        draft.loading = false;
        draft.error = action.payload;
      }),
    [String(updateCloneProgress)]: (state: StatusState, action: any) =>
      produce<StatusState>(state, draft => {
        draft.status[action.payload.repoUri] = {
          ...action.payload,
          state: RepoState.CLONING,
        };
      }),
    [String(updateIndexProgress)]: (state: StatusState, action: any) =>
      produce<StatusState>(state, draft => {
        const progress = action.payload.progress;
        draft.status[action.payload.repoUri] = {
          ...action.payload,
          state: progress < 100 ? RepoState.INDEXING : RepoState.READY,
        };
      }),
    [String(updateDeleteProgress)]: (state: StatusState, action: any) =>
      produce<StatusState>(state, draft => {
        draft.status[action.payload.repoUri] = {
          ...action.payload,
          state: RepoState.DELETING,
        };
      }),
  },
  initialState
);