import React from "react";

if (process.env.WEBPACK) {
  require("./Input.css"); // eslint-disable-line global-require
}
class Input extends React.Component {
  constructor(props) {
    super(props);
  }

  handleChange(event) {
    this.props.callback(event.target.value);
  }
  render() {
    return (
      <div className="input-group">
        <input
          className="input-element"
          type={this.props.type}
          required
          value={this.props.value}
          onChange={e => this.handleChange(e)}
        />
        <span className="input-highlight" />
        <span className="input-bar" />
        <label className="input-label">{this.props.label}</label>
      </div>
    );
  }
}

export default Input;
