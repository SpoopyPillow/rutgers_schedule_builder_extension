function load_template(template_id) {
    return document.querySelector("template#" + template_id);
}

function clone_template(template_id) {
    return load_template(template_id).content.cloneNode(true);
}

function clone_with_sync(element) {
    const clone = element.cloneNode(true);
    clone.onclick = element.onclick;
    clone.onmouseenter = element.onmouseenter;
    clone.onmouseleave = element.onmouseleave;
    return clone;
}

function standard_to_military_time(time) {
    const [hours, minutes, period] = time.match(/(\d+):(\d+) (\w+)/).slice(1);
    let militaryHours = parseInt(hours);

    if (period.toLowerCase() === "pm" && militaryHours !== 12) {
        militaryHours += 12;
    } else if (period.toLowerCase() === "am" && militaryHours === 12) {
        militaryHours = 0;
    }

    return militaryHours + ":" + minutes;
}

function military_to_standard_time(time) {
    let [hours, minutes] = time.split(":").map((value) => parseInt(value));
    const period = hours >= 12 ? "pm" : "am";

    if (hours > 12) {
        hours -= 12;
    } else if (hours === 0) {
        hours = 12;
    }

    return hours + ":" + minutes.toString().padStart(2, "0") + " " + period;
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
    if (element == null) {
        return;
    }
    remove_children(element);
    element.remove();
}

function remove_children(element) {
    if (element == null) {
        return;
    }
    while (element.firstChild) {
        element.removeChild(element.lastChild);
    }
}
