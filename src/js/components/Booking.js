import { select, templates, settings } from "../settings.js";
import { utils } from "../utils.js";
import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";

class Booking {
  constructor(bookingWidget) {
    const thisBooking = this;
    thisBooking.bookingWidget = bookingWidget;
    thisBooking.render(thisBooking.bookingWidget);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  getData() {
    const thisBooking = this;
    const startDataParam =
      settings.db.dateStartParamKey +
      "=" +
      utils.dateToStr(thisBooking.datePickerkWidget.minDate);
    const endDataParam =
      settings.db.dateEndParamKey +
      "=" +
      utils.dateToStr(thisBooking.datePickerkWidget.maxDate);

    const params = {
      bookings: [startDataParam, endDataParam],
      eventsCurrent: [settings.db.notRepeatParam, startDataParam, endDataParam],
      eventsRepeat: [settings.db.repeatParam, endDataParam],
    };
    // console.log(params);
    const urls = {
      bookings:
        settings.db.url +
        "/" +
        settings.db.bookings +
        "?" +
        params.bookings.join("&"),
      eventsCurrent:
        settings.db.url +
        "/" +
        settings.db.events +
        "?" +
        params.eventsCurrent.join("&"),
      eventsRepeat:
        settings.db.url +
        "/" +
        settings.db.events +
        "?" +
        params.eventsRepeat.join("&"),
    };
    // console.log(urls);

    Promise.all([
      fetch(urls.bookings),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function (allReponses) {
        const bookingsResponse = allReponses[0];
        const eventsCurrentResponse = allReponses[1];
        const eventsRepeatResponse = allReponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        console.log("bookings: ", bookings);
        console.log("eventsCurrent: ", eventsCurrent);
        console.log("eventsRepeat: ", eventsRepeat);
      });
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
