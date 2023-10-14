class BaseWidget {
  constructor(wrapperElement, initialValue) {
    const thisWidget = this;
    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;

    thisWidget.correctValue = initialValue;
  }

  get value() {
    const thisWidget = this;
    return thisWidget.correctValue;
  }

  // set and validate amount input
  set value(value) {
    const thisWidget = this;

    const newValue = thisWidget.parseValue(value);

    // add validation
    if (thisWidget.correctValue !== newValue && thisWidget.isValid(newValue)) {
      thisWidget.correctValue = newValue;
      thisWidget.announce();
    }
    thisWidget.renderValue();
  }

  parseValue(value) {
    return parseInt(value);
  }

  setValue(value) {
    const thisWidget = this;
    thisWidget.value = value;
  }

  isValid(value) {
    return !isNaN(value);
  }

  renderValue() {
    const thisWidget = this;
    thisWidget.dom.wrapper.innerHTML = thisWidget.value;
  }

  announce() {
    const thisWidget = this;
    const event = new CustomEvent("update", { bubbles: true });
    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}

export default BaseWidget;
