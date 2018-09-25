import React from "react";
import TextField from "@material-ui/core/TextField";

if (process.env.WEBPACK) {
  require("./InputText.css"); // eslint-disable-line global-require
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
      <TextField
        onChange={event => this.handleChange(event)}
        label={this.props.label}
        type={this.props.type}
        value={this.props.value}
      />
    );
  }
}

export default Input;
