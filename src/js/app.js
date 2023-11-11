import { settings, select, classNames } from "./settings.js";
import Product from "./components/Product.js";
import Cart from "./components/Cart.js";
import Booking from "./components/Booking.js";
import HomePage from "./components/HomePage.js";

const app = {
  initPages: function () {
    const thisApp = this;
    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.hash.replace("#/", "");

    let pageMatchingHash = thisApp.pages[0].id;
    for (let page of thisApp.pages) {
      if (page.id == idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePage(pageMatchingHash);

    for (let link of thisApp.navLinks) {
      link.addEventListener("click", function (event) {
        const clickedElement = this;
        event.preventDefault();

        // get page id from href attributr
        const id = clickedElement.getAttribute("href").replace("#", "");

        // run thisApp.activatePage whit that id
        thisApp.activatePage(id);

        // change URL hash
        window.location.hash = "#/" + id;
      });
    }
  },

  activatePage: function (pageId) {
    const thisApp = this;
    // add class active to matching page, remove from non-matching
    for (let page of thisApp.pages) {
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }
    // add class active to matching LINK (in menu), remove from non-matching
    for (let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute("href") == "#" + pageId
      );
    }
  },

  initMenu: function () {
    const thisApp = this;

    for (let productData in thisApp.data.products) {
      new Product(
        thisApp.data.products[productData].id,
        thisApp.data.products[productData]
      );
    }
  },

  initBooking: function () {
    const thisApp = this;
    thisApp.bookingWidget = document.querySelector(select.containerOf.booking);
    thisApp.booking = new Booking(thisApp.bookingWidget);
  },

  initHomePage: function () {
    const thisApp = this;
    thisApp.homePageDom = document.querySelector(select.containerOf.homePage);
    //console.log("thisApp.homePageDom", thisApp.homePageDom);
    thisApp.homePage = new HomePage(thisApp.homePageDom);
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
        // save parsedResponse as thisApp.data.products
        thisApp.data.products = parsedResponse;
        // execut initMenu method
        thisApp.initMenu();
      });
  },

  init: function () {
    const thisApp = this;
    // reads a parameter after hash and activates the visibility of his div (page content)
    // then activates and deactivates chosen links in the menu
    thisApp.initPages();

    // retrieves data from the product database and creates an instance of Product class for each item
    // which generates the menu (page content) in constructor
    thisApp.initData();

    // create basket using Cart class
    thisApp.initCart();

    // create booking page using Booking class
    thisApp.initBooking();

    // create home page using HomePage class
    thisApp.initHomePage();
  },

  initCart: function () {
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener("add-to-cart", function (event) {
      app.cart.add(event.detail.product);
    });
  },
};

app.init();
