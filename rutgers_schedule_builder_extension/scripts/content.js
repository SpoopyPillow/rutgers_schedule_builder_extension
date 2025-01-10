function restructure_original() {
    const tab_link = document.querySelector('div[widgetid="dijit_layout__TabButton_2"]');
    tab_link.addEventListener("click", update_schedule_builder);

    structure_sidebar();
    update_schedule_builder();
}

function structure_sidebar() {
    const schedule_builder = document.getElementById("CSPBuildScheduleTab");

    // SCHEDULE CONTENT
    const schedule_content = document.createElement("div");
    schedule_content.className =
        "schedule_content dijitContentPane dijitBorderContainer-dijitContentPane dijitBorderContainerPane";
    schedule_content.style = "inset: 5px 5px 5px 310px";
    [...schedule_builder.childNodes].forEach((child) => schedule_content.appendChild(child));
    schedule_builder.appendChild(schedule_content);

    // SCHEDULE SIDEBAR
    const sidebar = document.createElement("div");
    sidebar.className =
        "schedule_sidebar box dijitContentPane dijitBorderContainer-dijitContentPane dijitBorderContainerPane";
    sidebar.style = "top: 5px; bottom: 5px; left: 5px";

    schedule_builder.prepend(sidebar);
}

function update_schedule_builder() {
    remove_original_meetings();
    extract_selected_courses();
    schedule_data.load_course_list();
}

function remove_original_meetings() {
    const meetings = document.querySelectorAll('#CSPBuildScheduleTab div[class^="MeetingTime  campus_"]');

    for (const meeting of meetings) {
        remove_element(meeting);
    }
}

function extract_selected_courses() {
    schedule_data = new Schedule();

    const section_select = document.getElementById("SectionSelectID");

    const courses = section_select.querySelectorAll(".course");
    for (const course of courses) {
        const course_data = new Course(
            course.querySelector(".number .unit-code").textContent +
                ":" +
                course.querySelector(".number .subject").textContent +
                ":" +
                course.querySelector(".number .number").textContent,
            course.querySelector(".title").textContent
        );

        const sections = course.querySelectorAll('tr[dojoattachpoint="sectionMainArea"]');
        for (const section of sections) {
            const section_data = new Section(
                section.querySelector('td[title="Index Number"]').textContent,
                section.querySelector('td[title="Section Number"]').textContent,
                section.querySelector('td[title="Section Status"]').textContent
            );

            const meetings = section.querySelectorAll('tr[id^="csp_view_domain_Meeting_"]');
            for (const meeting of meetings) {
                const meeting_data = new Meeting(
                    meeting.querySelector(".weekday").textContent.toLowerCase(),
                    format_time(meeting.querySelector(".time").textContent.split("-")[0]),
                    format_time(meeting.querySelector(".time").textContent.split("-")[1]),
                    meeting.querySelector(".location3").textContent.toLowerCase(),
                    meeting.querySelector(".location").textContent
                );

                section_data.append_meeting(meeting_data);
            }

            course_data.append_section(section_data, section.querySelector("input").checked);
        }

        schedule_data.append_course(course_data);
    }

    console.log(schedule_data);
}

async function inject_content() {
    await wait_for_element("#CSPBuildScheduleTab");
    restructure_original();
}

inject_content();
