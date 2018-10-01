import React from "react";
import { Link } from "react-router";

// Import can't be in conditional so use require.
if (process.env.WEBPACK) {
  require("./Header.css"); // eslint-disable-line global-require
}

const Header = () => (
  <div className="Header">
    <h1 className="Header-title">Yes Bank</h1>
    <ul className="Header-menu">
      <Link to="/">Home</Link>
    </ul>
    <img src={"img/khana.jpg"} />
  </div>
);

export default Header;
