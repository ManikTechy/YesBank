import Constants from "../constants/Constants";
import * as types from "../constants/authTypes";
import YBApi from "../lib/api";
import config from "../lib/config";

export const REQUEST_POSTS = "REQUEST_POSTS";
export const RECEIVE_POSTS = "RECEIVE_POSTS";
export const REQUEST_POST = "REQUEST_POST";
export const RECEIVE_POST = "RECEIVE_POST";

export const requestPosts = () => ({
  type: REQUEST_POSTS,
});

export const receivePosts = json => ({
  type: RECEIVE_POSTS,
  posts: json.data.slice(0, 10).map(child => child) || [],
  receivedAt: Date.now(),
});

export const requestPost = () => ({
  type: REQUEST_POST,
});

export const receivePost = json => ({
  type: RECEIVE_POST,
  posts: json.data[0],
  receivedAt: Date.now(),
});

export const fetchPosts = () => ({
  type: REQUEST_POSTS,
});


const shouldFetchPosts = () => {
  const posts = false;
  if (!posts) {
    return true;
  }
  if (posts.isFetching) {
    return false;
  }
  return posts.didInvalidate;
};

export const fetchPostsIfNeeded = () => (dispatch, getState) => {
  if (shouldFetchPosts(getState())) {
    dispatch(fetchPosts());
  }
};

export function getStats() {
  return async dispatch => {
    await YBApi.get(
      Constants.exportURL() + config.endpoint.stats,
      null
    ).then(
      response => {
        dispatch({ type: types.STATS_SUCCESS, payload: response });
      },
      error => {
        dispatch({ type: types.STATS_FAILURE });
      }
    );
  };
}
