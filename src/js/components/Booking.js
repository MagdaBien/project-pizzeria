import { select, templates } from "../settings.js";
import AmountWidget from "./AmountWidget.js";

class Booking {
  constructor(bookingWidget) {
    const thisBooking = this;
    thisBooking.bookingWidget = bookingWidget;
    thisBooking.render(thisBooking.bookingWidget);
    thisBooking.initWidgets();
  }

  render(element) {
    const thisBooking = this;
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;

    const generatedHTML = templates.bookingWidget(); // generate HTML based on templete
    thisBooking.dom.wrapper.innerHTML = generatedHTML; // add element to menu

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.peopleAmount
    );
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.hoursAmount
    );
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.hoursAmountWidget = new AmountWidget(
      thisBooking.dom.hoursAmount
    );
    thisBooking.dom.hoursAmount.addEventListener("update", function () {});
    thisBooking.peopleAmountWidget = new AmountWidget(
      thisBooking.dom.peopleAmount
    );
    thisBooking.dom.peopleAmount.addEventListener("update", function () {});
  }
}
export default Booking;
