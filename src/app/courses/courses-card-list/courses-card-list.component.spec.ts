import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';

import { CoursesModule } from "../courses.module";
import { setupCourses } from "../common/setup-test-data";

import { CoursesCardListComponent } from "./courses-card-list.component";

describe('CoursesCardListComponent', () => {
    let component: CoursesCardListComponent;
    let fixture: ComponentFixture<CoursesCardListComponent>;
    let el: DebugElement;

    beforeEach(waitForAsync (() => {   // no need to use async here as it's deprecated since v12, original code contains waitForAsync
        TestBed.configureTestingModule({
            imports: [CoursesModule] 
            // actually import all those modules imports in courseModule and all declarations over there, as well a series of services - providers 
            // this is to make sure to provide the env for run the tests 
        })

            .compileComponents()
            .then(() => {                       // the promise gets executed only when complie complets
                fixture = TestBed.createComponent(CoursesCardListComponent);
                component = fixture.componentInstance;
                el = fixture.debugElement; // with this to populate all DOM elements for late test use
            })
    }) );

    it('should create the component', () => { // make sure the component is created correctly
        expect(component).toBeTruthy();
        //console.log(component);
    });

    it('should display the course list', () => {
        component.courses = setupCourses();

        // DOM should be updated with the latest data got from setupCourse(), 
        // manually using detectChanges to apply those changes to DOM
        // here there are no synconized operations invluced, we need use detectChanges to ensure changes are updated
        // this way without using async makes the spec code easy to read, otherwise, you have to use test utility to ensure sync
        fixture.detectChanges();

        const cards = el.queryAll(By.css(".course-card"));
        //console.log(el.nativeElement.outerHTML); // print out DOM elements to console

        expect(cards).toBeTruthy("Could not find cards");
        expect(cards.length).toBe(12, "Unexpected number of courses");
    });

    it('should display the first course', () => {
        
        component.courses = setupCourses();
        
        fixture.detectChanges();

        const course = component.courses[0];
        const card = el.query(By.css(".course-card:first-child")), // corresponding to the first course in the list
                title = card.query(By.css("mat-card-title")),
                image = card.query(By.css("img"));

        expect(card).toBeTruthy("Could not find course card");
        expect(title.nativeElement.textContent).toBe(course.titles.description);
        expect(image.nativeElement.src).toBe(course.iconUrl);

        
    });
})