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
        online: "O",
    };

    constructor(year, term, student_id) {
        this.courses = new Array();
        this.schedule_section = new Array();
        this.term = term;
        this.year = year;
        this.student_id = student_id;
    }

    static day_to_num(day) {
        return Schedule.DAY_NUM[day.toLowerCase()];
    }

    static campus_to_num(campus) {
        return Schedule.CAMPUS_NUM[campus.toLowerCase()] ?? 8;
    }

    static campus_travel_time(campus1, campus2) {
        if (campus1 == campus2) {
            return 0;
        } else if (
            (campus1 == "busch" && campus2 == "livingston") ||
            (campus1 == "livingston" && campus2 == "busch")
        ) {
            return 0;
        } else if (
            (campus1 == "college avenue" && campus2 == "downtown") ||
            (campus1 == "downtown" && campus2 == "college avenue")
        ) {
            return 0;
        } else {
            return 40;
        }
    }

    append_course(course, selected = -1) {
        this.courses.push(course);
        this.schedule_section.push(selected);
    }

    async load_course_list() {
        const schedule_sidebar = document.querySelector("#CSPBuildScheduleTab .schedule_sidebar");
        const template = await load_template("template_course");

        remove_children(schedule_sidebar);

        for (let course_index = 0; course_index < this.courses.length; course_index++) {
            const course_data = this.courses[course_index];

            const template_clone = template.content.cloneNode(true);
            const course = template_clone.querySelector(".course");

            course.querySelector(".code").textContent = course_data.code;
            course.querySelector(".title").textContent = course_data.title;

            course.onclick = (event) => {
                this.toggle_section_list(course, course_index);
            };

            course.onmouseenter = (event) => {
                if (schedule_sidebar.querySelector(".focused_course") == null) {
                    this.focus_schedule_course(course_index);
                    this.focus_async_course(course_index);
                }
            };

            course.onmouseleave = (event) => {
                if (schedule_sidebar.querySelector(".focused_course") == null) {
                    this.unfocus_schedule_course();
                    this.unfocus_async_course();
                }
            };

            schedule_sidebar.appendChild(template_clone);
        }

        this.initialize_async_courses();
    }

    async toggle_section_list(course, course_index) {
        const course_data = this.courses[course_index];

        this.unfocus_schedule_course();
        this.unfocus_async_course();
        remove_element(course.parentElement.querySelector(".section_list"));

        if (course.classList.contains("focused_course")) {
            course.classList.remove("focused_course");
            return;
        }
        this.focus_schedule_course(course_index);
        this.focus_async_course(course_index);
        course.parentElement.querySelector(".focused_course")?.classList.remove("focused_course");
        course.classList.add("focused_course");

        const template_section_list_clone = (await load_template("template_section_list")).content.cloneNode(true);
        const section_list = template_section_list_clone.querySelector(".section_list");
        const possible_sections = section_list.querySelector(".possible_sections_list");

        const template_section = await load_template("template_section");

        for (let section_index = 0; section_index < course_data.selected.length; section_index++) {
            if (!course_data.selected[section_index]) {
                continue;
            }

            const template_section_clone = template_section.content.cloneNode(true);

            const section = template_section_clone.querySelector(".section");
            section.classList.add("section_" + section_index);

            section.querySelector(".number").textContent = course_data.sections[section_index].number;

            section.onclick = (event) => {
                this.toggle_select_schedule_section(course_index, section_index);
                this.load_async_courses();
            };

            section.onmouseenter = (event) => {
                this.hover_schedule_section(course_index, section_index);
                this.hover_async_section(course_index, section_index);
            };

            section.onmouseleave = (event) => {
                this.unhover_schedule_section();
                this.load_async_courses();
            };

            possible_sections.appendChild(template_section_clone);
        }

        course.after(template_section_list_clone);
        this.sync_overlapping_sections(course_index);
        this.sync_selected_section(course_index);
    }

    toggle_select_schedule_section(course_index, section_index) {
        this.schedule_section[course_index] =
            this.schedule_section[course_index] === section_index ? -1 : section_index;

        const overlapping = this.schedule_overlap(course_index);
        for (const overlap_index of overlapping) {
            this.schedule_section[overlap_index] = -1;
            this.remove_schedule_section(overlap_index);
        }

        if (overlapping.size > 0) {
            this.sync_overlapping_sections(course_index);
        }
        this.sync_selected_section(course_index);

        this.remove_schedule_section(course_index);
        this.load_schedule_section(course_index, this.schedule_section[course_index]);
    }

    sync_selected_section(course_index) {
        const schedule_sidebar = document.querySelector("#CSPBuildScheduleTab .schedule_sidebar");
        const selected_section = schedule_sidebar.querySelector(".selected_section_list");

        remove_children(selected_section);

        const section_index = this.schedule_section[course_index];
        if (section_index === -1) {
            const placeholder = document.createElement("div");
            placeholder.className = "placeholder";
            placeholder.textContent = "No section selected";
            selected_section.appendChild(placeholder);
            return;
        }

        const section = schedule_sidebar.querySelector(".possible_sections_list .section_" + section_index);
        selected_section.appendChild(clone_with_sync(section));
    }

    sync_overlapping_sections(course_index) {
        const schedule_sidebar = document.querySelector("#CSPBuildScheduleTab .schedule_sidebar");
        const overlapping_sections = schedule_sidebar.querySelector(".overlapping_sections_list");

        const course_data = this.courses[course_index];
        for (let section_index = 0; section_index < course_data.sections.length; section_index++) {
            if (!course_data.selected[section_index]) {
                continue;
            }

            const section = schedule_sidebar.querySelector(".possible_sections_list .section_" + section_index);

            if (!this.schedule_overlap_with([[course_index, section_index]])) {
                section.style.display = "";
                remove_element(overlapping_sections.querySelector(".section_" + section_index));
                continue;
            }

            overlapping_sections.appendChild(clone_with_sync(section));
            section.style.display = "none";
        }

        if (overlapping_sections.childElementCount === 0) {
            remove_element(overlapping_sections.parentElement);
        }
    }

    load_schedule() {
        const schedule = document.querySelector("#CSPBuildScheduleTab .WeekScheduleDisplay");

        for (const meeting of schedule.querySelectorAll(".schedule_meeting")) {
            remove_element(meeting);
        }

        for (let course_index = 0; course_index < this.courses.length; course_index++) {
            const section_index = this.schedule_section[course_index];

            this.load_schedule_section(course_index, section_index);
        }
    }

    load_schedule_section(course_index, section_index) {
        if (section_index === -1) {
            return;
        }

        const schedule = document.querySelector("#CSPBuildScheduleTab .WeekScheduleDisplay");
        const day_columns = schedule.querySelectorAll(".DaySpanDisplay");

        const course_data = this.courses[course_index];
        const section_data = course_data.sections[section_index];

        for (const meeting_data of section_data.meetings) {
            if (meeting_data.start_time === null) {
                continue;
            }

            const meeting = document.createElement("div");
            meeting.className = [
                "schedule_meeting",
                "MeetingTime",
                "campus_" + Schedule.campus_to_num(meeting_data.campus),
                section_data.status,
                "course_" + course_index,
            ].join(" ");

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

    remove_schedule_section(course_index) {
        const schedule = document.querySelector("#CSPBuildScheduleTab .WeekScheduleDisplay");

        schedule.querySelectorAll(".schedule_meeting.course_" + course_index).forEach((meeting) => {
            remove_element(meeting);
        });
    }

    hover_schedule_section(course_index, section_index) {
        if (this.schedule_section[course_index] === section_index) {
            return;
        }

        const schedule = document.querySelector("#CSPBuildScheduleTab .WeekScheduleDisplay");

        schedule.querySelectorAll(".schedule_meeting.course_" + course_index).forEach((meeting) => {
            meeting.classList.add("schedule_unfocused_section");
        });

        this.load_schedule_section(course_index, section_index);
        schedule
            .querySelectorAll(".schedule_meeting.course_" + course_index + ":not(.schedule_unfocused_section)")
            .forEach((meeting) => {
                meeting.classList.add("schedule_focused_section");
                meeting.style.boxShadow =
                    "0px 0px 0px 7px " + window.getComputedStyle(meeting).backgroundColor + " inset";
                meeting.style.background = "none";
            });

        for (const overlap_index of this.schedule_overlap_with([[course_index, section_index]], course_index)) {
            schedule.querySelectorAll(".schedule_meeting.course_" + overlap_index).forEach((meeting) => {
                meeting.classList.add("overlapping_section");
            });
        }
    }

    unhover_schedule_section() {
        const schedule = document.querySelector("#CSPBuildScheduleTab .WeekScheduleDisplay");

        schedule.querySelectorAll(".schedule_focused_section").forEach((meeting) => {
            remove_element(meeting);
        });

        schedule.querySelectorAll(".schedule_unfocused_section").forEach((meeting) => {
            meeting.classList.remove("schedule_unfocused_section");
        });

        schedule.querySelectorAll(".overlapping_section").forEach((meeting) => {
            meeting.classList.remove("overlapping_section");
        });
    }

    focus_schedule_course(course_index) {
        if (course_index === -1) {
            return;
        }

        const schedule = document.querySelector("#CSPBuildScheduleTab .WeekScheduleDisplay");

        for (const meeting of schedule.querySelectorAll(".schedule_meeting")) {
            if (!meeting.classList.contains("course_" + course_index)) {
                meeting.classList.add("schedule_unfocused_course");
            }
        }
    }

    unfocus_schedule_course() {
        const schedule = document.querySelector("#CSPBuildScheduleTab .WeekScheduleDisplay");

        for (const meeting of schedule.querySelectorAll(".schedule_unfocused_course")) {
            meeting.classList.remove("schedule_unfocused_course");
        }
    }

    async initialize_async_courses() {
        const async_courses = document.getElementById("byArrangementCoursesDiv");
        const template = await load_template("template_async_course");

        for (let course_index = 0; course_index < this.courses.length; course_index++) {
            const course_data = this.courses[course_index];

            const template_clone = template.content.cloneNode(true);
            const async_course = template_clone.querySelector(".async_course");
            async_course.classList.add("course_" + course_index);
            async_course.querySelector(".title").textContent = course_data.title;
            async_course.querySelector(".code").textContent = course_data.code;
            async_course.style.display = "none";
            async_courses.appendChild(async_course);
        }
    }

    load_async_courses() {
        const async_courses = document.getElementById("byArrangementCoursesDiv");
        this.clean_hover_async_section();

        let position = 0;
        for (const [course_index, section_index] of this.schedule_section.entries()) {
            const async_course = async_courses.querySelector(".course_" + course_index);

            if (section_index === -1) {
                async_course.style.display = "none";
                continue;
            }

            const course_data = this.courses[course_index];
            const section_data = course_data.sections[section_index];

            if (
                !section_data.meetings
                    .map((meeting) => meeting.start_time)
                    .some((start_time) => start_time === null)
            ) {
                async_course.style.display = "none";
                continue;
            }
            position += 1;

            async_course.querySelector(".position").textContent = "[" + position + "]";
            async_course.querySelector(".section").textContent = section_data.number;
            async_course.querySelector(".index").textContent = section_data.index;
            async_course.querySelector(".status").textContent = section_data.status;

            async_course.style.display = "";
        }
    }

    hover_async_section(course_index, section_index) {
        if (this.schedule_section[course_index] === section_index) {
            return;
        }

        const course_data = this.courses[course_index];
        const section_data = course_data.sections[section_index];

        const async_courses = document.getElementById("byArrangementCoursesDiv");
        const course = async_courses.querySelector(".course_" + course_index);
        const clone = course.cloneNode(true);
        course.classList.add("async_unfocused_section");

        for (const overlap_index of this.schedule_overlap_with([[course_index, section_index]], course_index)) {
            async_courses.querySelector(".course_" + overlap_index).classList.add("async_overlapping_section");
        }

        if (
            !section_data.meetings.map((meeting) => meeting.start_time).some((start_time) => start_time === null)
        ) {
            return;
        }

        clone.classList.add("async_focused_section");
        clone.querySelector(".position").textContent = "";
        clone.querySelector(".section").textContent = section_data.number;
        clone.querySelector(".index").textContent = section_data.index;
        clone.querySelector(".status").textContent = section_data.status;
        clone.style.display = "";

        course.after(clone);
    }

    clean_hover_async_section() {
        const async_courses = document.getElementById("byArrangementCoursesDiv");
        remove_element(async_courses.querySelector(".async_focused_section"));
        async_courses.querySelector(".async_unfocused_section")?.classList.remove("async_unfocused_section");
        async_courses.querySelector(".async_overlapping_section")?.classList.remove("async_overlapping_section");
    }

    focus_async_course(course_index) {
        const async_courses = document.getElementById("byArrangementCoursesDiv");
        const course = async_courses.querySelector(".course_" + course_index);
        course.classList.add("async_focused_course");
    }

    unfocus_async_course() {
        const async_courses = document.getElementById("byArrangementCoursesDiv");
        async_courses.querySelector(".async_focused_course")?.classList.remove("async_focused_course");
    }

    schedule_overlap(inserted = null) {
        const day_intervals = {};

        for (const [course_index, section_index] of this.schedule_section.entries()) {
            if (section_index === -1) {
                continue;
            }
            const course = this.courses[course_index];
            const section = course.sections[section_index];

            for (const section_class of section.meetings) {
                if (section_class.start_time === null) {
                    continue;
                }

                const day = section_class.day;

                if (!(day in day_intervals)) {
                    day_intervals[day] = [];
                }

                day_intervals[day].push([
                    to_minutes(section_class.start_time),
                    to_minutes(section_class.end_time),
                    section_class.campus,
                    course_index,
                ]);
            }
        }

        const interfering = new Set();
        for (const [day, intervals] of Object.entries(day_intervals)) {
            intervals.sort((a, b) => a[0] - b[0]);

            for (var i = 1; i < intervals.length; i++) {
                const cur = intervals[i];
                const prev = intervals[i - 1];
                if (cur[0] >= prev[1] + Schedule.campus_travel_time(prev[2], cur[2])) {
                    continue;
                }

                if (inserted != null) {
                    interfering.add(cur[3] === inserted ? prev[3] : cur[3]);
                } else {
                    return true;
                }
            }
        }

        if (inserted != null) {
            return interfering;
        }
        return false;
    }

    schedule_overlap_with(changes, inserted = null) {
        const previous = [...this.schedule_section];
        for (const [course_index, section_index] of changes) {
            this.schedule_section[course_index] = section_index;
        }
        const output = this.schedule_overlap(inserted);
        this.schedule_section = previous;
        return output;
    }

    fetch_save_schedule() {
        const schedule_builder = document.getElementById("CSPBuildScheduleTab");
        const label = schedule_builder.querySelector('div[dojoattachpoint="noMessage"] input').value;

        const indicies = new Array();
        for (const [course_index, course] of this.courses.entries()) {
            const section_index = this.schedule_section[course_index];
            if (section_index === -1) {
                continue;
            }
            indicies.push(course.sections[section_index].index);
        }

        fetch("saveSchedule.json", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                term: this.term,
                year: this.year,
                label: label,
                sections: indicies,
                studentId: this.student_id,
            }),
        });
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
