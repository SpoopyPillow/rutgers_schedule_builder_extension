function get_build_tab() {
    return document.getElementById("CSPBuildScheduleTab");
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
