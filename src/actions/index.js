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
  posts: json.slice(0, 10).map(child => child) || [],
  receivedAt: Date.now(),
});

export const requestPost = () => ({
  type: REQUEST_POST,
});

export const receivePost = json => ({
  type: RECEIVE_POST,
  posts: json[0],
  receivedAt: Date.now(),
});

export function fetchPosts() {
  return dispatch => {
    YBApi.get("https://jsonplaceholder.typicode.com/posts", null).then(
      response => {
        dispatch(receivePosts(response));
      },
      error => {
        dispatch({ type: types.STATS_FAILURE });
      }
    );
  };
}

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
  console.log("fetchPostsIfNeeded");
  if (shouldFetchPosts(getState())) {
    dispatch(fetchPosts());
  }
};

export function getStats() {
  console.log("CONFIG", process.env);
  return dispatch => {
    YBApi.get(Constants.exportURL() + config.endpoint.stats, null).then(
      response => {
        dispatch({ type: types.STATS_SUCCESS, payload: response });
      },
      error => {
        dispatch({ type: types.STATS_FAILURE });
      }
    );
  };
}

export function getNewStatas() {
  return dispatch => {
    YBApi.get(Constants.exportURL() + "/request/linebar", null).then(
      response => {
        dispatch({ type: "Manik", payload: response });
      },
      error => {
        dispatch({ type: types.STATS_FAILURE });
      }
    );
  };
}

export function getOldStats() {
  return dispatch => {
    YBApi.get(Constants.exportURL() + "/request/bookmarked", null).then(
      response => {
        dispatch({ type: "AYUSH", payload: response });
      },
      error => {
        dispatch({ type: types.STATS_FAILURE });
      }
    );
  };
}
