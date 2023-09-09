import { settings, select, templates } from "../settings.js";
import CartProduct from "./CartProduct.js";
import { utils } from "../utils.js";

class Cart {
  constructor(element) {
    const thisCart = this;
    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.initActions();
  }

  getElements(element) {
    const thisCart = this;
    thisCart.dom = {};
    thisCart.dom.wrapper = element;

    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(
      select.cart.toggleTrigger
    );
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(
      select.cart.productList
    );
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(
      select.cart.deliveryFee
    );
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(
      select.cart.subtotalPrice
    );
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(
      select.cart.totalPrice
    );
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(
      select.cart.totalNumber
    );
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(
      select.cart.address
    );
  }

  initActions() {
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener("click", function () {
      thisCart.dom.wrapper.classList.toggle("active");
    });
    thisCart.dom.productList.addEventListener("update", function () {
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener("remove", function () {
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener("submit", function (event) {
      event.preventDefault();
      //const clickedElement = this;
      thisCart.sendOrder();
    });
  }

  sendOrder() {
    const thisCart = this;
    const url = settings.db.url + "/" + settings.db.orders;

    // create object with data to send order
    const payload = {};
    payload.address = thisCart.dom.address.value;
    payload.phone = thisCart.dom.phone.value;
    payload.totalPrice = thisCart.totalPrice;
    payload.subtotalPrice = thisCart.subtotalPrice;
    payload.totalNumber = thisCart.totalNumer;
    payload.deliveryFee = thisCart.deliveryFee;
    payload.products = [];

    for (let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options);

    console.log(payload);
  }

  add(menuProduct) {
    const thisCart = this;

    const generatedHTML = templates.cartProduct(menuProduct);
    thisCart.element = utils.createDOMFromHTML(generatedHTML);
    const cartContainer = document.querySelector(select.cart.productList);
    cartContainer.appendChild(thisCart.element);

    thisCart.products.push(new CartProduct(menuProduct, thisCart.element));
    thisCart.update();
  }

  update() {
    const thisCart = this;
    const deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.dom.deliveryFee.innerHTML = 0;
    let subtotalNumber = 0;
    let subtotalPrice = 0;
    thisCart.totalPrice = 0;

    for (let cartProduct of thisCart.products) {
      subtotalNumber += cartProduct.amount;
      subtotalPrice += cartProduct.price;
    }
    thisCart.totalNumer = subtotalNumber;

    if (subtotalPrice > 0) {
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
      thisCart.totalPrice = subtotalPrice + deliveryFee;
    }

    thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumer;
    for (let price of thisCart.dom.totalPrice) {
      price.innerHTML = thisCart.totalPrice;
    }
    thisCart.deliveryFee = deliveryFee;
    thisCart.subtotalPrice = subtotalPrice;
  }

  // remove product from basket and update price
  remove(product) {
    const thisCart = this;

    // remowe from HTML
    product.dom.wrapper.remove();

    //delProduct.remove();
    console.log("removing", product);

    // remowe from table thisCart.products
    const indexOfProduct = thisCart.products.indexOf(product);
    if (indexOfProduct != -1) thisCart.products.splice(indexOfProduct, 1);

    // start update method
    thisCart.update();
  }
}
export default Cart;
