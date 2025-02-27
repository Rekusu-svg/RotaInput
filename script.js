let selectedDays = {};
let weekDates = [];
const defaultClockIn = "15:00";
const defaultClockOut = "23:59";

document.addEventListener("DOMContentLoaded", () => {
    generateWeek();
});

function generateWeek() {
    const today = new Date();
    const startDate = new Date(today);
    const dayOfWeek = today.getDay();
    const daysToFriday = (dayOfWeek <= 5) ? 5 - dayOfWeek : 5 + (7 - dayOfWeek);
    startDate.setDate(today.getDate() - daysToFriday); // Sets start to the Friday of the current week

    const days = ["Friday", "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
    const calendar = document.querySelector(".calendar");
    const customTimes = document.querySelector(".custom-times");
    calendar.innerHTML = "";
    customTimes.innerHTML = "";
    weekDates = [];

    days.forEach((day, index) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + index);
        weekDates.push(date.toISOString().split('T')[0]);

        // Create day selection box
        const dayDiv = document.createElement("div");
        dayDiv.classList.add("day");
        dayDiv.setAttribute("data-index", index);
        dayDiv.innerHTML = `<strong>${day}</strong><br>${date.toDateString()}<br><span class="timeslot"></span>`;
        dayDiv.addEventListener("click", () => toggleShift(dayDiv));
        calendar.appendChild(dayDiv);

        // Create custom time selection box
        const timeDiv = document.createElement("div");
        timeDiv.classList.add("custom-time");

        // Clock-in time input (30-minute intervals)
        const clockInInput = document.createElement("input");
        clockInInput.type = "time";
        clockInInput.value = defaultClockIn;
        clockInInput.step = "1800"; // 30-minute intervals

        // Clock-out time input (30-minute intervals)
        const clockOutInput = document.createElement("input");
        clockOutInput.type = "time";
        clockOutInput.value = defaultClockOut;
        clockOutInput.step = "1800"; // 30-minute intervals
        clockOutInput.disabled = true;

        // Checkbox for custom clock-out
        const customCheck = document.createElement("input");
        customCheck.type = "checkbox";
        customCheck.addEventListener("change", () => {
            clockOutInput.disabled = !customCheck.checked;
            if (!customCheck.checked) clockOutInput.value = defaultClockOut;
        });

        // Submit button for custom time
        const submitButton = document.createElement("button");
        submitButton.textContent = "Submit Custom Time";
        submitButton.addEventListener("click", () => submitCustomShift(index, clockInInput.value, clockOutInput.value));

        // Append elements
        timeDiv.appendChild(document.createTextNode("Clock In: "));
        timeDiv.appendChild(clockInInput);
        timeDiv.appendChild(document.createElement("br"));
        timeDiv.appendChild(customCheck);
        timeDiv.appendChild(document.createTextNode(" Custom Clock-Out"));
        timeDiv.appendChild(document.createElement("br"));
        timeDiv.appendChild(document.createTextNode(""));
        timeDiv.appendChild(clockOutInput);
        timeDiv.appendChild(document.createElement("br"));
        timeDiv.appendChild(submitButton);
        customTimes.appendChild(timeDiv);
    });
}

function toggleShift(day) {
    const index = day.getAttribute("data-index");
    selectedDays[index] = selectedDays[index] ? 0 : 1;
    updateDayDisplay(day, index);
}

function updateDayDisplay(day, index) {
    day.classList.toggle("selected", !!selectedDays[index]);
    day.querySelector(".timeslot").textContent = selectedDays[index] ? "Shift Selected" : "";
}

function submitCustomShift(index, startTime, endTime) {
    const date = new Date(weekDates[index]);
    const formattedDate = formatDate(date);
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/u/0/r/eventedit?text=Work+Shift&dates=${formattedDate}T${formatTime(startTime)}-0000/${formattedDate}T${formatTime(endTime)}-0000`;

    window.open(googleCalendarUrl, "_blank");
}

function submitShifts() {
    let repeatDays = new Set();
    let firstDate = null;

    Object.keys(selectedDays).forEach(index => {
        if (selectedDays[index]) {
            const date = new Date(weekDates[index]);
            const formattedDate = formatDate(date);

            if (!firstDate || date < new Date(firstDate)) firstDate = formattedDate;
            repeatDays.add(date.getDay());
        }
    });

    if (firstDate) {
        const lastDate = formatDate(new Date(weekDates[weekDates.length - 1]));
        const repeatRule = [...repeatDays].map(day => ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][day]).join(",");

        const googleCalendarUrl = `https://calendar.google.com/calendar/u/0/r/eventedit?text=Work+Shift&dates=${firstDate}T150000-0000/${firstDate}T235900-0000&recur=RRULE:FREQ=WEEKLY;BYDAY=${repeatRule};UNTIL=${lastDate}T235900Z`;

        window.open(googleCalendarUrl, "_blank");
    }
}

function formatDate(date) {
    return date.getFullYear() + String(date.getMonth() + 1).padStart(2, '0') + String(date.getDate()).padStart(2, '0');
}

function formatTime(time) {
    return time.replace(":", "") + "00";
}
