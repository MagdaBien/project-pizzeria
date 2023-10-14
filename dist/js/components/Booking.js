import { select, templates } from "../settings.js";
import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";

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
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.datePicker.wrapper
    );
    thisBooking.dom.rangeSlider = thisBooking.dom.wrapper.querySelector(
      select.widgets.hourPicker.wrapper
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

    thisBooking.datePickerkWidget = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.dom.datePicker.addEventListener("update", function () {});

    thisBooking.rangeSliderWidget = new HourPicker(thisBooking.dom.rangeSlider);
    thisBooking.dom.rangeSlider.addEventListener("update", function () {});
  }
}
export default Booking;
