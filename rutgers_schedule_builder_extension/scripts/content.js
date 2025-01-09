function restructure_original() {
    const tab_link = document.querySelector('div[widgetid="dijit_layout__TabButton_2"]');
    tab_link.addEventListener("click", update_schedule_builder);

    schedule_data.extract_selected_courses();
    remove_original_meetings();
}

function update_schedule_builder() {
    schedule_data.extract_selected_courses();
    remove_original_meetings();
}

function remove_original_meetings() {
    const meetings = document.querySelectorAll('#CSPBuildScheduleTab div[class^="MeetingTime  campus_"]');

    for (const meeting of meetings) {
        remove_element(meeting);
    }
}

async function inject_content() {
    await wait_for_element("#CSPBuildScheduleTab");
    restructure_original();
}

inject_content();
