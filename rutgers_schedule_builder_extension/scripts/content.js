function restructure_original() {
    const tab_link = document.querySelector('div[widgetid="dijit_layout__TabButton_2"]');
    tab_link.addEventListener("click", update_schedule_builder);

    structure_sidebar();
    update_schedule_builder();
}

function structure_sidebar() {
    const schedule_builder = document.getElementById("CSPBuildScheduleTab");

    // SCHEDULE VIEW
    const schedule_view = document.createElement("div");
    schedule_view.className =
        "schedule_view dijitContentPane dijitBorderContainer-dijitContentPane dijitBorderContainerPane";
    schedule_view.style = "inset: 5px 5px 5px 310px";
    [...schedule_builder.childNodes].forEach((child) => schedule_view.appendChild(child));
    schedule_builder.appendChild(schedule_view);

    // SCHEDULE SIDEBAR
    const sidebar = document.createElement("div");
    sidebar.className =
        "schedule_sidebar box dijitContentPane dijitBorderContainer-dijitContentPane dijitBorderContainerPane";
    sidebar.style = "top: 5px; bottom: 5px; left: 5px";

    schedule_builder.prepend(sidebar);
}

function update_schedule_builder() {
    remove_original_meetings();
    schedule_data.extract_selected_courses();
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
