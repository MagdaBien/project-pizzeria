import { templates, select, classNames } from "../settings.js";

class HomePage {
  constructor(homePageWidget) {
    const thisHomePage = this;
    thisHomePage.homePageWidget = homePageWidget;
    thisHomePage.render(thisHomePage.homePageWidget);
    thisHomePage.initPages();
  }

  render(element) {
    const thisHomePage = this;
    thisHomePage.dom = {};
    thisHomePage.dom.wrapper = element;

    const generatedHTML = templates.homePage(); // generate HTML based on templete
    thisHomePage.dom.wrapper.innerHTML = generatedHTML; // add element to menu
  }

  initPages() {
    const thisHomePage = this;
    thisHomePage.pages = document.querySelector(
      select.containerOf.pages
    ).children;
    thisHomePage.navLinks = document.querySelectorAll(select.nav.links);
    thisHomePage.pageLinks = document.querySelectorAll(select.nav.sideNav);

    const idFromHash = window.location.hash.replace("#/", "");

    let pageMatchingHash = thisHomePage.pages[0].id;
    for (let page of thisHomePage.pages) {
      if (page.id == idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }

    thisHomePage.activatePage(pageMatchingHash);

    for (let link of thisHomePage.pageLinks) {
      link.addEventListener("click", function (event) {
        const clickedElement = this;
        event.preventDefault();

        // get page id from href attributr
        const id = clickedElement.getAttribute("href").replace("#", "");

        // run thisHomePage.activatePage whit that id
        thisHomePage.activatePage(id);

        // change URL hash
        window.location.hash = "#/" + id;
      });
    }
  }

  activatePage(pageId) {
    const thisHomePage = this;
    // add class active to matching page, remove from non-matching
    for (let page of thisHomePage.pages) {
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }
    // add class active to matching LINK (in menu), remove from non-matching
    for (let link of thisHomePage.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute("href") == "#" + pageId
      );
    }
  }
}

export default HomePage;
