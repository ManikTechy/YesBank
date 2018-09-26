import http from "axios";
import config from "./config";

class YBApi {
  static headers() {
    return {
      "Content-Type": "application/json",
    };
  }
  static baseHeaders() {
    return {
      "Content-Type": "application/json",
    };
  }

  static baseUrl() {
    const baseUrl = config[process.env.NODE_ENV];
    return "";
  }
  static get(route, headers) {
    return this.api("get", route, headers);
  }

  static put(route, headers, params, data) {
    return this.api("put", route, headers, params, data);
  }

  static post(route, headers, params, data) {
    return this.api("post", route, headers, params, data);
  }

  static patch(route, headers, params, data) {
    return this.api("patch", route, headers, params, data);
  }

  static delete(route, headers, params) {
    return this.api("delete", route, headers, params);
  }

  static api(requestType, route, headers, params, data) {
    const host = YBApi.baseUrl();
    const url = `${host}${route}`;
    console.log("The url: ", url);

    const baseHeaders = YBApi.headers();
    const requestConfig = {
      headers: headers ? Object.assign({}, baseHeaders, headers) : baseHeaders,
    };

    if (params) {
      requestConfig.params = params;
    }

    http.create();
    http.defaults.timeout = 2000;

    if (requestType === "get" || requestType === "delete") {
      return http[requestType](url, requestConfig)
        .then(response => {
          console.log("response", response);
          return response.data;
        })
        .catch(error => {
          console.log("error for get", error);
          return Promise.reject(error);
        });
    }

    return http[requestType](url, data, requestConfig)
      .then(response => {
        console.log("response", response);
        return response;
      })
      .catch(error => {
        console.log("error for post", error);
        return Promise.reject(error);
      });
  }
}

export default YBApi;
