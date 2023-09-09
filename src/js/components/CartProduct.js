import { select } from "../settings.js";
import AmountWidget from "./AmountWidget.js";

class CartProduct {
  constructor(menuProduct, element) {
    const thisCartProduct = this;
    thisCartProduct.getElements(element);

    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.params = menuProduct.params;
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();

    //console.log("thisCartProduct.amount", thisCartProduct.amount);
  }

  getElements(element) {
    const thisCartProduct = this;
    thisCartProduct.dom = {};
    thisCartProduct.dom.wrapper = element;

    thisCartProduct.dom.amountWidget =
      thisCartProduct.dom.wrapper.querySelector(
        select.cartProduct.amountWidget
      );
    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(
      select.cartProduct.price
    );
    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(
      select.cartProduct.edit
    );
    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(
      select.cartProduct.remove
    );
  }

  // create a new instance of the AmountWidget class and put into product property
  initAmountWidget() {
    const thisCartProduct = this;
    thisCartProduct.amountWidget = new AmountWidget(
      thisCartProduct.dom.amountWidget
    );
    thisCartProduct.amountWidget.setValue(thisCartProduct.amount);
    thisCartProduct.dom.amountWidget.addEventListener("update", function () {
      thisCartProduct.amount = thisCartProduct.amountWidget.value;
      thisCartProduct.price =
        thisCartProduct.amount * thisCartProduct.priceSingle;
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      // console.log("thisCartProduct.price", thisCartProduct.price);
    });
  }

  // remove from basket
  remove() {
    const thisCartProduct = this;

    const event = new CustomEvent("remove", {
      bubbles: true,
      detail: { cartProduct: thisCartProduct },
    });
    thisCartProduct.dom.wrapper.dispatchEvent(event);
    //console.log("remove from cart");
  }

  initActions() {
    const thisCartProduct = this;
    thisCartProduct.dom.edit.addEventListener("click", function () {});
    thisCartProduct.dom.remove.addEventListener("click", function () {
      thisCartProduct.remove();
    });
  }
  getData() {
    const thisCartProduct = this;
    const orderData = {};
    orderData.id = thisCartProduct.id;
    orderData.amount = thisCartProduct.amount;
    orderData.price = thisCartProduct.price;
    orderData.priceSingle = thisCartProduct.priceSingle;
    orderData.name = thisCartProduct.name;
    orderData.params = thisCartProduct.params;
    return orderData;
  }
}
export default CartProduct;
