import { settings, select } from "../settings.js";
import BaseWidget from "./BaseWidget.js";

// as input: whole div with input field, buttons +/- etc
class AmountWidget extends BaseWidget {
  constructor(element) {
    super(element, settings.amountWidget.defaultValue);
    const thisWidget = this;
    thisWidget.getElements(element);
    thisWidget.initActions();
    thisWidget.setValue(thisWidget.dom.input.valu);

    // console.log("AmountWidget: ", thisWidget);
  }

  // founded DOM item - input field, buttons +/- etc (create references)
  getElements() {
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.input
    );
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.linkDecrease
    );
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.linkIncrease
    );
  }

  isValid(value) {
    return (
      !isNaN(value) &&
      value >= settings.amountWidget.defaultMin &&
      value <= settings.amountWidget.defaultMax
    );
  }

  renderValue() {
    const thisWidget = this;
    thisWidget.dom.input.value = thisWidget.value;
  }

  // adds EventListener to form elements and set value +/-1
  initActions() {
    const thisWidget = this;
    thisWidget.dom.input.addEventListener("change", function () {
      // thisWidget.setValue(parseInt(thisWidget.dom.input.value));
      thisWidget.value(parseInt(thisWidget.dom.input.value));
    });
    thisWidget.dom.linkDecrease.addEventListener("click", function () {
      thisWidget.setValue(parseInt(thisWidget.dom.input.value) - 1);
    });
    thisWidget.dom.linkIncrease.addEventListener("click", function () {
      thisWidget.setValue(parseInt(thisWidget.dom.input.value) + 1);
    });
  }
}
export default AmountWidget;
