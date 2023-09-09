import { select, classNames, templates } from "../settings.js";
import { utils } from "../utils.js";
import AmountWidget from "./AmountWidget.js";

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

    //app.cart.add(thisProduct.prepareCartProduct());

    const event = new CustomEvent("add-to-cart", {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    });
    thisProduct.element.dispatchEvent(event);
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

export default Product;
