function format_time(time) {
    const [hours, minutes, period] = time.match(/(\d+):(\d+) (\w+)/).slice(1);
    let militaryHours = parseInt(hours);

    if (period.toLowerCase() === "pm" && militaryHours !== 12) {
        militaryHours += 12;
    } else if (period.toLowerCase() === "am" && militaryHours === 12) {
        militaryHours = 0;
    }

    return militaryHours + ":" + minutes;
}

function to_minutes(time) {
    const [hours, minutes] = time.split(":").map((value) => parseInt(value));
    return hours * 60 + minutes;
}

function wait_for_element(selector) {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            const element = document.querySelector(selector);

            if (element != null) {
                clearInterval(interval);
                resolve(element);
            }
        }, 100);
    });
}

function remove_element(element) {
    remove_children(element);
    element.remove();
}

function remove_children(element) {
    while (element.firstChild) {
        element.removeChild(element.lastChild);
    }
}
