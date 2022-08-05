import { flush, tick } from '@angular/core/testing';
import { ComponentFixture, waitForAsync, TestBed, fakeAsync } from '@angular/core/testing';
import { DebugElement } from "@angular/core";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import {By} from '@angular/platform-browser';

import { of } from 'rxjs';

import { CoursesModule } from "../courses.module";
import { setupCourses } from "../common/setup-test-data";
import { click } from '../common/test-utils';
import { CoursesService } from "../services/courses.service";

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
    let fixture: ComponentFixture<HomeComponent>;
    let component: HomeComponent;
    let el: DebugElement;
    let coursesService: any; //should not be the origianly defined CoursesService as this will be the one retrieved from TestBed;

    const beginnerCourses = setupCourses() // note there is no () after findAllCourse as there is "and" for return value
        .filter(course => course.category == 'BEGINNER');
    const advancedCourses = setupCourses()
        .filter(course => course.category == "ADVANCED");

    beforeEach(waitForAsync(() => { // here waitForAsync detect all the block as a test zone, essentially to track the promise then() utility used here, waiting for the then block to be evaluated before the beforeEach block is considered completed. such a mechanism looks similar to the use of fakeAsync() used in the tests

        const CoursesServiceSpy = jasmine.createSpyObj('CoursesService', ['findAllCourses']); // here list all the methods that will be used in this test

        TestBed.configureTestingModule({
            imports: [
                CoursesModule,
                NoopAnimationsModule // stands for no opeation animatiion, essentially, with this there will no animation although this project's componet actually does have animation, without this, our angular component with animation would break
            ],
            providers: [
                {provide: CoursesService, useValue: CoursesServiceSpy}
            ]
        }).compileComponents()
            // again using waitForAsync to ensure below promise block got executed and those variables got filled before any of tests get to run
            .then(() => {
                fixture = TestBed.createComponent(HomeComponent);
                component = fixture.componentInstance;
                el = fixture.debugElement;
                coursesService = TestBed.inject(CoursesService); // cousesService will be using the one retrieved from testBed
            });       
    }));

    it("shoud create the component", () => {
        expect(component).toBeTruthy();
    });

    it("should display only beginner course", () => {
        
        coursesService.findAllCourses.and.returnValue(of(beginnerCourses)); // return an observable of beginnerCourses, by using this, everything will happen sychnoyslly
        
        fixture.detectChanges(); // apply the changes to DOM

        const tabs = el.queryAll(By.css(".mat-tab-label"));
        
        expect(tabs.length).toBe(1, "Unexpected number of tabs found");
    });

    it("should display only advanced course", () => {
        
        coursesService.findAllCourses.and.returnValue(of(advancedCourses)); // return an observable of beginnerCourses, by using this, everything will happen sychnoyslly
        
        fixture.detectChanges(); // apply the changes to DOM

        const tabs = el.queryAll(By.css(".mat-tab-label"));
        
        expect(tabs.length).toBe(1, "Unexpected number of tabs found");
    });

    it("should display both tabs", () => {
        coursesService.findAllCourses.and.returnValue(of(setupCourses())); // return an observable of beginnerCourses, by using this, everything will happen sychnoyslly
        
        fixture.detectChanges(); // apply the changes to DOM

        const tabs = el.queryAll(By.css(".mat-tab-label"));
        
        expect(tabs.length).toBe(2, "Expected to find 2 tabs");
    });

    // below test failed by simply using Jasmine done() callback, which actually can't resove the problem
    xit("should display advanced courses when tab clicked", (done: DoneFn) => {
        coursesService.findAllCourses.and.returnValue(of(setupCourses())); // return an observable of beginnerCourses, by using this, everything will happen sychnoyslly
        
        fixture.detectChanges(); // apply the changes to DOM

        const tabs = el.queryAll(By.css(".mat-tab-label"));

        // el.nativeElement.click(); // note this "click" is the DOM api other than the angular api, alternatively, use the utility function which the project created to similute user click action
        click(tabs[1]); // click the second tab "Advanced"
        fixture.detectChanges(); // update DOM again otherwise, the course found will be still the 1st of BeginnerCourses, however, this does not resolved the issue

        setTimeout(() => {
            const cardTitles = el.queryAll(By.css('.mat-tab-body-active .mat-card-title'));
            expect(cardTitles.length).toBeGreaterThan(0, "Could not find card titles");
            expect(cardTitles[0].nativeElement.textContent).toContain("Angular Security Course");
            done();
        }, 500); 
    });

    // to replace or modify the above test
    // in below, fakeAsync() will track all asynchronous tasks
    it("should display advanced courses when tab clicked for advanced - fakeAsync", fakeAsync(() => {
        coursesService.findAllCourses.and.returnValue(of(setupCourses()));
        
        fixture.detectChanges();

        const tabs = el.queryAll(By.css(".mat-tab-label"));
        
        click(tabs[1]);  // user interaction 
        fixture.detectChanges();

        flush(); // tick(16) also works, however not recommended as you need to kwown the internal time to wait;
        // here flush() works as for both flushMicroTasks and flushMacroTasks?

        const cardTitles = el.queryAll(By.css('.mat-tab-body-active .mat-card-title')); // important to use both to identify the el by css
        expect(cardTitles.length).toBeGreaterThan(0, "Could not find card titles");
        expect(cardTitles[0].nativeElement.textContent).toContain("Angular Security Course");
    }) );

    // rewrite above test by other than using fakeAsync() but async as used in beforeEach()
    // in below, with waitForAsync you can't call flush(), we do not have full control over tasks of microTasks, also can't call tick() and control over time inside the test
    // it also does not allow to write assertions as do in other tests, instead waitForAsync does track any async operations within the test
    // to make sure all sync operations done, using whenStable() callback 
    // whenStable() return the promise to make sure all inside be complete 
    // overall, with this well set up, the test passed. however, it's far inconvenient than fakeAsync();
    it("should display advanced courses when tab clicked for advanced - async", waitForAsync(() => {
        coursesService.findAllCourses.and.returnValue(of(setupCourses()));
        
        fixture.detectChanges();

        const tabs = el.queryAll(By.css(".mat-tab-label"));
        
        click(tabs[1]);
        
        fixture.detectChanges();

        fixture.whenStable().then(() => {
            console.log("called whenStable()");
            const cardTitles = el.queryAll(By.css('.mat-tab-body-active .mat-card-title'));
            expect(cardTitles.length).toBeGreaterThan(0, "Could not find card titles");
            expect(cardTitles[0].nativeElement.textContent).toContain("Angular Security Course");
        });        
    }) );
})

