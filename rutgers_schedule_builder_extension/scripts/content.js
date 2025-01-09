function restructure_original() {
    const tab_link = document.querySelector(
        'div[widgetid="dijit_layout__TabButton_2"]'
    );
    tab_link.addEventListener("click", remove_meetings);

    remove_meetings();
}

function remove_meetings() {
    const meetings = get_build_tab().querySelectorAll(
        'div[class^="MeetingTime  campus_"]'
    );

    for (const meeting of meetings) {
        remove_element(meeting);
    }
}

async function inject_content() {
    await wait_for_element("#CSPBuildScheduleTab");
    restructure_original();
}

inject_content();
