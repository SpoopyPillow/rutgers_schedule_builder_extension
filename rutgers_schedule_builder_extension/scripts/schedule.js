class Schedule {
    constructor() {
        this.courses = new Array();
        this.section_index = new Array();
    }

    append_course(course, selected = -1) {
        this.courses.push(course);
        this.section_index.push(selected);
    }

    extract_selected_courses() {
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

    load_selected_courses() {
        const schedule_sidebar = document.querySelector(".schedule_sidebar");

        remove_children(schedule_sidebar);

        for (const course_data of this.courses) {
            const course = document.createElement("div");
            course.className = "course";
            course.textContent = course_data.code + " - " + course_data.title.toUpperCase();
            course.onclick = (event) => {
                this.toggle_selected_sections(course, course_data);
            };

            schedule_sidebar.appendChild(course);
        }
    }

    toggle_selected_sections(course, course_data) {
        remove_element(course.parentElement.querySelector(".section_list"));

        if (course.classList.contains("focused_course")) {
            course.classList.remove("focused_course");
            return;
        }
        course.parentElement.querySelector(".focused_course")?.classList.remove("focused_course");
        course.classList.add("focused_course");

        const section_list = document.createElement("div");
        section_list.className = "section_list";

        for (let section_index = 0; section_index < course_data.selected.length; section_index++) {
            if (!course_data.selected[section_index]) {
                continue;
            }

            const section = document.createElement("div");
            section.className = "section";
            section.textContent = course_data.sections[section_index].number;

            section_list.appendChild(section);
        }

        course.after(section_list);
    }
}

class Course {
    constructor(code, title) {
        this.code = code;
        this.title = title;
        this.sections = new Array();
        this.selected = new Array();
    }

    append_section(section, selected = true) {
        this.sections.push(section);
        this.selected.push(selected);
    }
}

class Section {
    constructor(index, number, status) {
        this.index = index;
        this.number = number;
        this.status = status;
        this.meetings = new Array();
    }

    append_meeting(meeting) {
        this.meetings.push(meeting);
    }
}

class Meeting {
    constructor(day, start_time, end_time, campus, location) {
        this.day = day;
        this.start_time = start_time;
        this.end_time = end_time;
        this.campus = campus;
        this.location = location;
    }
}
