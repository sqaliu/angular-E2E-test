import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";

import { Course } from "../model/course";
import { COURSES, findLessonsForCourse } from "../../../../server/db-data";

import { CoursesService } from "./courses.service";

xdescribe("CoursesService", () => {

    let coursesService: CoursesService,
        httpTestingController: HttpTestingController; // here is for get testing data

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                CoursesService,
                HttpClient
            ]
        });

        coursesService = TestBed.inject(CoursesService); // get() has been deprecated after 9
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    it('should retrieve all courses - Brian', () => {
        coursesService.findAllCourses()
            .subscribe(courses => {
                expect(courses).toBeTruthy("No courses returned"); // other than null or undefined
                expect(courses.length).toBe(12, "incorrect number of courses");

                const course = courses.find(course => course.id == 12);
                expect(course.titles.description).toBe("Angular Testing Course");
            });

        const req = httpTestingController.expectOne('/api/courses');

        expect(req.request.method).toEqual("GET");

        // provide test data
        req.flush({payload: Object.values(COURSES)}); // return test data, an array of course, http://localhost:9000/api/courses        
    });

    it("should find a course by id - Brian", () => {
        coursesService.findCourseById(12)
            .subscribe(course => {
                expect(course).toBeTruthy();
                expect(course.id).toBe(12);
            });
            
        const req = httpTestingController.expectOne('/api/courses/12');

        expect(req.request.method).toEqual("GET");
        
        req.flush(COURSES[12]); 
    });

    it("should save the course data", () => {
        const changes: Partial<Course> =
            {titles:{description: 'Testing Course'}};
        
        coursesService.saveCourse(12, changes) // suppose only make change to titles' description
            .subscribe(course => {
                expect(course.id).toBe(12);
            });

        const req = httpTestingController.expectOne('/api/courses/12');
        
        expect(req.request.method).toEqual("PUT");
        expect(req.request.body.titles.description)
            .toEqual(changes.titles.description);

        req.flush({...COURSES[12], ...changes});
    });

    it('should give an error if save course fails', () => {
        const changes: Partial<Course> = {titles:{description: 'Testing Course'}};

        coursesService.saveCourse(12, changes)
            .subscribe(
                () => fail("the save course operation should have failed"), //simply fail the test
                
                (error: HttpErrorResponse) => {
                    expect(error.status).toBe(500);
                    //error.error // for retrieve the error body
                }
            );
        
        const req = httpTestingController.expectOne('/api/courses/12');

        expect(req.request.method).toEqual("PUT");
        
        req.flush('Save course failed', {status: 500, statusText: 'Internal Server Errror'});
    });

    it('should find a list of lessons', () => {
        coursesService.findLessons(12)
            .subscribe(lessons => {
                expect(lessons).toBeTruthy();
                expect(lessons.length).toBe(3);
            });
        
        const req = httpTestingController.expectOne(
            req => req.url == '/api/lessons');

        expect(req.request.method).toEqual('GET');
        expect(req.request.params.get("courseId")).toEqual("12");
        expect(req.request.params.get("filter")).toEqual("");
        expect(req.request.params.get("sortOrder")).toEqual("asc");
        expect(req.request.params.get("pageNumber")).toEqual("0");
        expect(req.request.params.get("pageSize")).toEqual("3");

        req.flush({
            payload: findLessonsForCourse(12).slice(0,3)
        });
    })

    afterEach(() => {
        httpTestingController.verify();        // make sure the courseService iscalled only once for each test
    })

    
    
})