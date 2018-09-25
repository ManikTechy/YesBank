/* eslint-disable no-undef */
import React from "react";
import { expect } from "chai";
import { shallow } from "enzyme";
import Posts from "./Posts";

describe("Input", () => {
  it("renders", () => {
    const props = {
      posts: [],
    };
    const wrapper = shallow(<Input {...props} />);
    expect(wrapper.find(".Posts")).to.have.length(1);
  });
});
/* eslint-enable no-undef */
