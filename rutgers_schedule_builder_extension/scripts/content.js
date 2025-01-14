function restructure_original() {
    const tab_link = document.querySelector('div[widgetid="dijit_layout__TabButton_2"]');
    tab_link.addEventListener("click", update_schedule_builder);

    structure_sidebar();
    alter_page();
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

function alter_page() {
    const schedule_builder = document.getElementById("CSPBuildScheduleTab");
    remove_element(schedule_builder.querySelector("#ViewControlID"));

    const control_area = schedule_builder.querySelector('div[dojoattachpoint="noMessage"]');
    remove_children(control_area);

    const schedule_name = document.createElement("input");
    schedule_name.type = "text";
    schedule_name.placeholder = "Schedule Name";
    schedule_name.style.margin = "3px";
    control_area.appendChild(schedule_name);

    const save_button = document.createElement("button");
    save_button.textContent = "Save";
    save_button.style.margin = "3px";
    save_button.onclick = (event) => {
        schedule_data.fetch_save_schedule();
    };
    control_area.appendChild(save_button);

    const info = document.createElement("b");
    info.textContent = "* RELOAD PAGE TO SEE SAVED SCHEDULES (WILL ERASE CURRENT PROGRESS)";
    info.style.margin = "3px";
    control_area.appendChild(info);

    for (const element of document.querySelectorAll(".box-button-controls")) {
        remove_element(element);
    }
}

function update_schedule_builder() {
    show_schedule();
    remove_original_meetings();
    schedule_data.update_schedule_data(extract_schedule());
    schedule_data.load_course_list();
    schedule_data.load_schedule();
}

function show_schedule() {
    const schedule_view = document.getElementById("ScheduleDisplayID");
    schedule_view.style.visibility = "visible";
}

function remove_original_meetings() {
    const meetings = document.querySelectorAll('#CSPBuildScheduleTab div[class^="MeetingTime  campus_"]');
    for (const meeting of meetings) {
        remove_element(meeting);
    }

    const async_courses = document.getElementById("byArrangementCoursesDiv");
    remove_children(async_courses);
}

function extract_schedule() {
    const script = document.querySelector("script").innerHTML;
    const new_schedule_data = new Schedule(
        script.match(/"yearterm":"(\d+)"/)[1].slice(0, 4),
        script.match(/"yearterm":"(\d+)"/)[1].slice(4, 5),
        script.match(/"studentId":"(\d+)"/)[1]
    );

    const courses = document.querySelectorAll("#SectionSelectID .course");
    const courses_sidebar = document.querySelectorAll("#selected-courses tr");
    for (let course_index = 0; course_index < courses.length; course_index++) {
        const course = courses[course_index];
        const course_sidebar = courses_sidebar[course_index];

        const course_data = new Course(
            course.querySelector(".number .unit-code").textContent +
                ":" +
                course.querySelector(".number .subject").textContent +
                ":" +
                course.querySelector(".number .number").textContent,
            course_sidebar.querySelector(".course-title").textContent
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
                let time = meeting.querySelector(".time").textContent;

                const meeting_data = new Meeting(
                    meeting.querySelector(".weekday").textContent,
                    time === "" ? null : standard_to_military_time(time.split("-")[0]),
                    time === "" ? null : standard_to_military_time(time.split("-")[1]),
                    meeting.querySelector(".location3").textContent.toLowerCase(),
                    meeting.querySelector(".location").textContent
                );

                section_data.append_meeting(meeting_data);
            }

            course_data.append_section(section_data, section.querySelector("input").checked);
        }

        new_schedule_data.append_course(course_data);
    }

    return new_schedule_data;
}

async function inject_content() {
    await wait_for_element("#CSPBuildScheduleTab");
    restructure_original();
}

inject_content();
