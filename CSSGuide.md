
Yes Bank CSS Guide
===============================

The main purpose with this guide is to:
- Keep browser rendering _fast_
- Enable rapid development
- Keep the code base maintainable


We write future-standard CSS in a gracefully degrading way by compiling it to present CSS using [PostCSS](https://github.com/postcss/postcss).

- We use [CSS Modules](https://github.com/css-modules/css-modules) to scope all class names and animation names locally.
- We use [Stylelint](https://stylelint.io) to verify correct structure of styles. Please refer to `.stylelintrc.js` for more information on specific rules. Please install the `stylelint` plugin for your editor of choice.
## Spacing

- Use soft tabs with a 2 space indent
- Put one space after `:` and `,` and one space before `{`
- Use a semicolon after every declaration
- Put one declaration per line
- Each selector should have a single line.
- Use double-quotes in imports
- Large blocks of single declaration may use a single-line format: `.selector { line-height: 1.2em; }`

**Right:**
```css
@import './myStyleSheet.css';
.selector1,
.selector2 {
  background: url("image.png");
  margin-right: 10px;
}
```

**Wrong:**
```css
@import "./myStyleSheet.css";
.selector1, .selector2{
  background: url(image.png);
    color:#FFF;
  color:  #FFF;
}
```

## Selectors

Don't use global, child, sibling or ID selectors.


## Declarations

We use [autoprefixer](https://github.com/postcss/autoprefixer) for browser prefixes, so those should be skipped.

Declarations should come in the following order:
- Positioning
- Display and Box Model
- Presentational
- Type related

They may be seperated by a newline if it becomes too heavy to read.
Comment on code if you feel like it's hard to understand.

Example:
```css
.box {
  /* 1. Positioning in logical order */
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: var(--z-index-box);

  /* 2. Display and Box Model in logical order */
  width: 100px;
  height: 30px;
  padding: 8px;
  border: 3px solid var(--color-border-base);
  margin: 50px;

  /* 3. Presentational in alphabetical order */
  background: #555, url("image.png");
  transition: all 0.3s;

  /* 4. Type related in alphabetical order */
  color: #000
  font-family: "Helvetica";
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5em;
}
```

Note that `box-sizing` is set to `border-box` on `*`, `*::before` and `*::after`.


## Variables

Try to reference variables as much as possible, specially for color and font values.
All `z-index` values should be referenced in the globals file to get an overview on their usage and prevent z-clashes.


## Colors

Try to define as few colors as possible by reference those in the global stylesheet.
We are using a [postcss color plugin](https://github.com/postcss/postcss-color-function) to make color manipulation nicer. It implements [a proposed](http://dev.w3.org/csswg/css-color/#modifying-colors) color function in CSS, allowing for things like:
```css
--color-red-darker: color(var(--color-red) shade(40%));
--color-red-lighter: color(var(--color-red) tint(40%));
--color-red-transparent: color(var(--color-red) alpha(40%));
```

## File structuring

Top level file references shared styles (variables)

Page references styles for manipulating a pages styles

A component references its own styles
