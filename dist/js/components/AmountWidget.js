import { settings, select } from "../settings.js";

// as input: whole div with input field, buttons +/- etc
class AmountWidget {
  constructor(element) {
    const thisWidget = this;
    thisWidget.getElements(element);
    thisWidget.setValue(settings.amountWidget.defaultValue);
    thisWidget.initActions();

    //console.log("constructor arguments: ", element);
  }

  // founded DOM item - input field, buttons +/- etc (create references)
  getElements(element) {
    const thisWidget = this;

    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(
      select.widgets.amount.input
    );
    thisWidget.linkDecrease = thisWidget.element.querySelector(
      select.widgets.amount.linkDecrease
    );
    thisWidget.linkIncrease = thisWidget.element.querySelector(
      select.widgets.amount.linkIncrease
    );
  }

  // set and validate amount input
  setValue(value) {
    const thisWidget = this;

    const newValue = parseInt(value);

    // add validation
    if (
      thisWidget.value !== newValue &&
      !isNaN(newValue) &&
      newValue >= settings.amountWidget.defaultMin &&
      newValue <= settings.amountWidget.defaultMax
    ) {
      thisWidget.value = newValue;
      thisWidget.announce();
    }
    thisWidget.input.value = thisWidget.value;
  }

  // adds EventListener to form elements and set value +/-1
  initActions() {
    const thisWidget = this;
    thisWidget.input.addEventListener("change", function () {
      thisWidget.setValue(parseInt(thisWidget.input.value));
    });
    thisWidget.linkDecrease.addEventListener("click", function () {
      thisWidget.setValue(parseInt(thisWidget.input.value) - 1);
    });
    thisWidget.linkIncrease.addEventListener("click", function () {
      thisWidget.setValue(parseInt(thisWidget.input.value) + 1);
    });
  }

  announce() {
    const thisWidget = this;
    const event = new CustomEvent("update", { bubbles: true });
    thisWidget.element.dispatchEvent(event);
  }
}
export default AmountWidget;
