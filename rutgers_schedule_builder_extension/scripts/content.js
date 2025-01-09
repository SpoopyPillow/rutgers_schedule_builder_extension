function restructure_original() {
    const tab_link = document.querySelector('div[widgetid="dijit_layout__TabButton_2"]');
    tab_link.addEventListener("click", update_schedule_builder);

    remove_original_meetings();
    extract_selected_courses();
}

function update_schedule_builder() {
    extract_selected_courses();
    remove_original_meetings();
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
            course.querySelector(".title").textContent,
        );

        const sections = course.querySelectorAll('tr[dojoattachpoint="sectionMainArea"]');
        for (const section of sections) {
            const section_data = new Section(
                section.querySelector('td[title="Index Number"]').textContent,
                section.querySelector('td[title="Section Number"]').textContent,
                section.querySelector('td[title="Section Status"]').textContent,
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

            course_data.append_section(section_data, section.querySelector('input').checked);
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
