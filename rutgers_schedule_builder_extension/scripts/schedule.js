class Schedule {
    static START_TIME = "8:00";
    static END_TIME = "23:00";
    static DAY_NUM = {
        monday: 0,
        tuesday: 1,
        wednesday: 2,
        thursday: 3,
        friday: 4,
        saturday: 5,
        sunday: 6,
    };
    static CAMPUS_NUM = {
        "college avenue": 1,
        busch: 2,
        livingston: 3,
        "cook/douglass": 4,
        downtown: 5,
        camden: 6,
        newark: 7,
    };

    constructor() {
        this.courses = new Array();
        this.section_index = new Array();
    }

    static day_to_num(day) {
        return Schedule.DAY_NUM[day.toLowerCase()];
    }

    static campus_to_num(campus) {
        return Schedule.CAMPUS_NUM[campus.toLowerCase()] ?? 8;
    }

    append_course(course, selected = -1) {
        this.courses.push(course);
        this.section_index.push(selected);
    }

    load_course_list() {
        const schedule_sidebar = document.querySelector(".schedule_sidebar");

        remove_children(schedule_sidebar);

        for (let course_index = 0; course_index < this.courses.length; course_index++) {
            const course_data = this.courses[course_index];

            const course = document.createElement("div");
            course.className = "course";
            course.textContent = course_data.code + " - " + course_data.title;
            course.onclick = (event) => {
                this.toggle_section_list(course, course_index);
            };

            schedule_sidebar.appendChild(course);
        }
    }

    toggle_section_list(course, course_index) {
        const course_data = this.courses[course_index];

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

            section.onclick = (event) => {
                this.toggle_select_schedule_section(course_index, section_index);
            };

            section.onmouseenter = (event) => {};

            section_list.appendChild(section);
        }

        course.after(section_list);
    }

    toggle_select_schedule_section(course_index, section_index) {
        this.section_index[course_index] = this.section_index[course_index] === section_index ? -1 : section_index;
        this.load_schedule();
    }

    load_schedule() {
        const schedule = document.querySelector("#CSPBuildScheduleTab .WeekScheduleDisplay");
        const day_columns = schedule.querySelectorAll(".DaySpanDisplay");

        for (const meeting of schedule.querySelectorAll(".schedule_meeting")) {
            remove_element(meeting);
        }

        for (let course_index = 0; course_index < this.courses.length; course_index++) {
            const course_data = this.courses[course_index];
            const section_index = this.section_index[course_index];

            if (section_index === -1) {
                continue;
            }

            const section_data = course_data.sections[section_index];
            this.load_schedule_section(course_data, section_data);
        }
    }

    load_schedule_section(course_data, section_data) {
        const schedule = document.querySelector("#CSPBuildScheduleTab .WeekScheduleDisplay");
        const day_columns = schedule.querySelectorAll(".DaySpanDisplay");

        for (const meeting_data of section_data.meetings) {
            const meeting = document.createElement("div");
            meeting.className =
                "schedule_meeting MeetingTime campus_" +
                Schedule.campus_to_num(meeting_data.campus) +
                " " +
                section_data.status;

            const interval_minutes = to_minutes(Schedule.END_TIME) - to_minutes(Schedule.START_TIME);
            const start_pos =
                ((to_minutes(meeting_data.start_time) - to_minutes(Schedule.START_TIME)) / interval_minutes) * 100;
            const end_pos =
                ((to_minutes(meeting_data.end_time) - to_minutes(Schedule.START_TIME)) / interval_minutes) * 100;

            meeting.style.top = start_pos + "%";
            meeting.style.height = end_pos - start_pos + "%";

            day_columns[Schedule.day_to_num(meeting_data.day)].appendChild(meeting);
        }
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
