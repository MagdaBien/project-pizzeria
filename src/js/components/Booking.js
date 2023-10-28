import { select, templates, settings, classNames } from "../settings.js";
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
    thisBooking.chosenTable = "";
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
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;
    thisBooking.booked = {};

    for (let item of bookings) {
      thisBooking.makeBooked(
        item.date,
        utils.numberToHour(item.hour),
        item.duration,
        item.table
      );
    }

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    const minDate = thisBooking.datePickerkWidget.minDate;
    const maxDate = thisBooking.datePickerkWidget.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == "daily") {
        for (
          let loopDate = minDate;
          loopDate <= maxDate;
          loopDate = utils.addDays(loopDate, 1)
        ) {
          thisBooking.makeBooked(
            utils.dateToStr(loopDate),
            item.hour,
            item.duration,
            item.table
          );
        }
      }
    }

    console.log("thisBooking.booked", thisBooking.booked);
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == "undefined") {
      thisBooking.booked[date] = {};
    }
    const startHour = utils.hourToNumber(hour);

    for (
      let hourBlock = startHour;
      hourBlock < startHour + duration;
      hourBlock += 0.5
    ) {
      if (typeof thisBooking.booked[date][hourBlock] == "undefined") {
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM() {
    const thisBooking = this;
    thisBooking.date = thisBooking.datePickerkWidget.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.rangeSliderWidget.value);

    let allAvailable = false;
    if (
      typeof thisBooking.booked[thisBooking.date] == "undefined" ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] ==
        "undefined"
    ) {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
        table.classList.remove(classNames.booking.tableSelected);
        thisBooking.chosenTable = "";
      }

      if (
        !allAvailable &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  initTables(event) {
    const thisBooking = this;
    const actualChosenTable = event.target.getAttribute(
      settings.booking.tableIdAttribute
    );

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);

        if (tableId == actualChosenTable) {
          if (table.classList.contains(classNames.booking.tableBooked)) {
            alert("Ten stolik jest zajęty już w wybranym przez Ciebie czasie.");
          } else {
            //console.log("Wolny stolik nr ", tableId);
            table.classList.toggle(classNames.booking.tableSelected);
            if (thisBooking.chosenTable == actualChosenTable) {
              thisBooking.chosenTable = "";
            } else {
              thisBooking.chosenTable = actualChosenTable;
            }
            //console.log("wybrany stolik: ", thisBooking.chosenTable);
          }
        } else {
          table.classList.remove(classNames.booking.tableSelected);
        }
      }
    }
  }

  sendBooking() {
    const thisBooking = this;
    const url = settings.db.url + "/" + settings.db.bookings;

    // create object with data to send order
    const payload = {};
    payload.date = thisBooking.date;
    payload.hour = thisBooking.hour;
    payload.table = parseInt(thisBooking.chosenTable);
    payload.duration = parseInt(thisBooking.hoursAmountWidget.value);
    payload.ppl = thisBooking.peopleAmountWidget.value;
    payload.phone = thisBooking.dom.phone.value;
    payload.address = thisBooking.dom.address.value;

    payload.starters = [];
    for (let starter of thisBooking.dom.bookingStarter) {
      if (starter.checked == true) payload.starters.push(starter.value);
    }

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then((res) => res.json())
      .then((parseResponse) =>
        thisBooking.makeBooked(
          parseResponse.date,
          utils.numberToHour(parseResponse.hour),
          parseResponse.duration,
          parseResponse.table
        )
      );

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId) && tableId == payload.table) {
        console.log("takenTable", payload.table);
        table.classList.remove(classNames.booking.tableSelected);
        table.classList.add(classNames.booking.tableBooked);
      }
    }
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
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(
      select.booking.tables
    );
    thisBooking.dom.floor = thisBooking.dom.wrapper.querySelector(
      select.booking.floor
    );
    thisBooking.dom.bookingform = thisBooking.dom.wrapper.querySelector(
      select.booking.bookingform
    );
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(
      select.booking.phone
    );
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(
      select.booking.address
    );

    thisBooking.dom.bookingStarter = thisBooking.dom.wrapper.querySelectorAll(
      select.booking.starters
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

    thisBooking.dom.wrapper.addEventListener("update", function () {
      thisBooking.updateDOM();
    });

    thisBooking.dom.floor.addEventListener("click", function (event) {
      thisBooking.initTables(event);
    });

    thisBooking.dom.bookingform.addEventListener("submit", function (event) {
      event.preventDefault();
      thisBooking.sendBooking();
    });
  }
}
export default Booking;
