class Course {
    constructor(code, title, sections) {
        this.code = code;
        this.title = title;
        this.sections = sections;
    }
}

class Section {
    constructor(index, number, status, meetings) {
        this.index = index;
        this.number = number;
        this.status = status;
        this.meetings = meetings;
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
