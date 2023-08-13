/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  ("use strict");

  const select = {
    templateOf: {
      menuProduct: "#template-menu-product",
      cartProduct: "#template-cart-product",
    },
    containerOf: {
      menu: "#product-list",
      cart: "#cart",
    },
    all: {
      menuProducts: "#product-list > .product",
      menuProductsActive: "#product-list > .product.active",
      formInputs: "input, select",
    },
    menuProduct: {
      clickable: ".product__header",
      form: ".product__order",
      priceElem: ".product__total-price .price",
      imageWrapper: ".product__images",
      amountWidget: ".widget-amount",
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: "input.amount",
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },

    cart: {
      productList: ".cart__order-summary",
      toggleTrigger: ".cart__summary",
      totalNumber: `.cart__total-number`,
      totalPrice:
        ".cart__total-price strong, .cart__order-total .cart__order-price-sum strong",
      subtotalPrice: ".cart__order-subtotal .cart__order-price-sum strong",
      deliveryFee: ".cart__order-delivery .cart__order-price-sum strong",
      form: ".cart__order",
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: ".widget-amount",
      price: ".cart__product-price",
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: "active",
      imageVisible: "active",
    },

    cart: {
      wrapperActive: "active",
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    },

    cart: {
      defaultDeliveryFee: 20,
    },

    db: {
      url: "//localhost:3131",
      products: "products",
      orders: "orders",
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(
      document.querySelector(select.templateOf.menuProduct).innerHTML
    ),
    cartProduct: Handlebars.compile(
      document.querySelector(select.templateOf.cartProduct).innerHTML
    ),
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
    }

    // generate HTML for product and insert this element into the menu
    renderInMenu() {
      const thisProduct = this;
      const generatedHTML = templates.menuProduct(thisProduct.data); // generate HTML based on templete
      thisProduct.element = utils.createDOMFromHTML(generatedHTML); // create element using utils.....
      const menuContainer = document.querySelector(select.containerOf.menu); // find menu container
      menuContainer.appendChild(thisProduct.element); // add element to menu
    }

    // founded DOM item - form, priceElem, cartButton etc (create references)
    getElements() {
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(
        select.menuProduct.clickable
      );
      thisProduct.form = thisProduct.element.querySelector(
        select.menuProduct.form
      );
      thisProduct.formInputs = thisProduct.form.querySelectorAll(
        select.all.formInputs
      );
      thisProduct.cartButton = thisProduct.element.querySelector(
        select.menuProduct.cartButton
      );
      thisProduct.priceElem = thisProduct.element.querySelector(
        select.menuProduct.priceElem
      );
      thisProduct.imageWrapper = thisProduct.element.querySelector(
        select.menuProduct.imageWrapper
      );
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(
        select.menuProduct.amountWidget
      );
    }

    // show and hide product details
    initAccordion() {
      const thisProduct = this;

      thisProduct.accordionTrigger.addEventListener("click", function (event) {
        /* prevent default action for event */
        event.preventDefault();

        /* find active product (product that has active class) */
        const activeLinks = document.querySelectorAll(".product.active");

        /* if there is active product and it's not thisProduct.element, remove class active from it */
        for (let activeLink of activeLinks) {
          if (activeLink != thisProduct.element) {
            activeLink.classList.remove("active");
          }
        }

        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle("active");
      });
    }

    // adds EventListener to form elements - runs onece for each product
    initOrderForm() {
      const thisProduct = this;

      thisProduct.form.addEventListener("submit", function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.formInputs) {
        input.addEventListener("change", function () {
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener("click", function (event) {
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    // calculate price for product according selected options
    processOrder() {
      const thisProduct = this;

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);

      // set price to default price
      let price = thisProduct.data.price;

      // CALCULATE ACTUAL PRICE ACCORDING CHOSEN PARAMS (INGREDIENTS)
      // for every category (param)...
      // e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      for (let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];

        // for every option in this category
        // e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        // cucumber = {label: 'Cucumber', price: 1, default: true}
        for (let optionId in param.options) {
          const option = param.options[optionId];
          const optionImage = thisProduct.imageWrapper.querySelector(
            "." + paramId + "-" + optionId
          );

          // check if there is param with a name of paramId in formData and if it includes optionId
          if (formData[paramId] && formData[paramId].includes(optionId)) {
            // console.log(thisProduct.id, optionId);

            if (optionImage) {
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            }

            // check if the option is not default
            if (!option.default) {
              price += option.price;
            }
          } else {
            if (optionImage) {
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }

            // check if the option is default
            if (option.default) {
              price -= option.price;
            }
          }
        }
      }
      // update calculated price in the HTML
      thisProduct.priceSingle = price;
      price *= thisProduct.amountWidget.value;
      thisProduct.priceElem.innerHTML = price;
    }

    // creatie a new instance of the AmountWidget class and put into product property
    initAmountWidget() {
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener("update", function () {
        thisProduct.processOrder();
      });
    }

    addToCart() {
      const thisProduct = this;

      app.cart.add(thisProduct.prepareCartProduct());
    }

    prepareCartProduct() {
      const thisProduct = this;

      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.amountWidget.value * thisProduct.priceSingle,
        params: thisProduct.prepareCartProductParams(),
      };
      return productSummary;
    }

    prepareCartProductParams() {
      const thisProduct = this;
      const params = {};

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);

      // for every category (param)...
      // e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      for (let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];

        // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
        params[paramId] = {
          label: param.label,
          options: {},
        };

        // for every option in this category
        for (let optionId in param.options) {
          const option = param.options[optionId];
          const optionSelected =
            formData[paramId] && formData[paramId].includes(optionId);

          if (optionSelected) {
            params[paramId].options[optionId] = option.label;
          }
        }
      }
      return params;
    }
  }

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
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(
        select.cart.phone
      );
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
      let subtotalNumber = 0;
      let subtotalPrice = 0;

      for (let cartProduct of thisCart.products) {
        subtotalNumber += cartProduct.amount;
        subtotalPrice += cartProduct.price;
      }
      thisCart.totalNumer = subtotalNumber;

      if (subtotalPrice > 0) {
        thisCart.dom.deliveryFee.innerHTML = deliveryFee;
        thisCart.totalPrice = subtotalPrice + deliveryFee;
      } else {
        thisCart.dom.deliveryFee.innerHTML = 0;
        thisCart.totalPrice = 0;
      }
      //console.log("thisCart.totalPrice", thisCart.totalPrice);
      //console.log("thisCart.totalAmount", thisCart.totalNumer);

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

  const app = {
    initMenu: function () {
      const thisApp = this;

      for (let productData in thisApp.data.products) {
        new Product(
          thisApp.data.products[productData].id,
          thisApp.data.products[productData]
        );
      }
    },

    initData: function () {
      const thisApp = this;
      const url = settings.db.url + "/" + settings.db.products;
      thisApp.data = {};
      fetch(url)
        .then(function (rawResponse) {
          return rawResponse.json();
        })
        .then(function (parsedResponse) {
          console.log("parsedResponse", parsedResponse);

          // save parsedResponse as thisApp.data.products
          thisApp.data.products = parsedResponse;

          // execut initMenu method
          thisApp.initMenu();
        });
      console.log("thisApp.data", JSON.stringify(thisApp.data));
    },

    init: function () {
      const thisApp = this;
      thisApp.initData();
      thisApp.initCart();
    },

    initCart: function () {
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },
  };

  app.init();
}
