import { fakeAsync, flush, flushMicrotasks, tick } from "@angular/core/testing";

import { of } from 'rxjs';
import { delay } from "rxjs/operators";

xdescribe("Async testing example", () => {

    it('Asynchronous test example with Jasmine done()', (done: DoneFn) => {

        let test = false;

        setTimeout(() => {
            //console.log("running assertion");
            let test = true;
            expect(test).toBeTruthy();

            done();
        }, 1000);
    });

    it('Asynchronous test example with setTimeout()', fakeAsync(() => {

        let test = false;

        setTimeout(() => {
        });

        setTimeout(() => {
            //console.log("running assertion setTimeout()");
            test = true;
            expect(test).toBeTruthy();
        }, 1000);

        //tick(1000);

        tick(500);
        tick(499);
        tick(1);
    }) );

    // to optimize above test, with fakeAsync(), the assertion is now no need to have to be placed inside the setTimeout()
    it('Asynchronous test example with setTimeout()', fakeAsync(() => {

        let test = false;

        setTimeout(() => {
            //console.log("running assertion setTimeout()");
            test = true;
        }, 1000);

        tick(1000);

        expect(test).toBeTruthy();
    }) );

    // by using flush(), it makes sure all those setTimeout() detedcted by fakeAsync() would have to be exectued before making the test complete
    it('Asynchronous test example with setTimeout()', fakeAsync(() => {

        let test = false;

        setTimeout(() => {});

        setTimeout(() => {
            //console.log("running assertion setTimeout()");
            test = true;
        }, 1000);

        flush();

        expect(test).toBeTruthy();
    }) );

    // with below test to understand sync(expect), async, microtask(promise), and macro task (setTimeout)
    xit("Asynchronous test example - plain promise", () => {
        let test = false;
        //console.log('creating promise');

        setTimeout(() => {
            //console.log('setTimeout() first callback triggered.');
        });

        setTimeout(() => {
            //console.log('setTimeout() second callback triggered.');
        });

        Promise.resolve().then(() => {
            //console.log('Promise first then() evaluated successfully');
            return Promise.resolve();
        })
            .then(() => {
                //console.log('Promise second then() evaluated successfully');
                test = true;
            });

        //console.log('Running test assertions');
        expect(test).toBeTruthy();
    });

    it("Asynchronous test example - plain promise", fakeAsync(() => {
        let test = false;
        //console.log('creating promise');        

        Promise.resolve().then(() => {
            //console.log('Promise first then() evaluated successfully');
            test = true;
        })
            .then(() => {
                //console.log('Promise second then() evaluated successfully');
            });

        flushMicrotasks();

        //console.log('Running test assertions');
        expect(test).toBeTruthy();
    }) );

    it('Asynchronous test example - Promises + setTimeout()', fakeAsync(() => {
        let counter = 0;
        
        Promise.resolve()        
            .then(() => {
                counter += 10;
                setTimeout(() => {
                    counter += 1;
                }, 1000);
            });
            
        expect(counter).toBe(0);

        flushMicrotasks();
        expect(counter).toBe(10);

        tick(500);
        expect(counter).toBe(10);

        tick(500);
        expect(counter).toBe(11);
    }) );

    // for those purely using observables without delay, all is sync, no need to apply fakeAsync()
    it('Asynchronous test example - Observable', () => {
        let test = false;
        
        console.log('Creating observable');
        const test$ = of(test); // purely synchronized observable

        test$.subscribe(() => { // due to using subscribe, this block gets immediately executed before the assertion
            test = true;
        });

        console.log('Running test assertions');
        expect(test).toBe(true);
        
    })

    // for those observable with dealy, the test works as for setTimeout()
    it('Asynchronous test example - Observable with delay', fakeAsync(() => {
        let test = false;
        
        console.log('Creating observable');
        const test$ = of(test).pipe(delay(1000)); // delay is an internal setTimeout operator

        test$.subscribe(() => { // with the dalay used above, this subscribe will be executed only after 1000ms
            test = true;
        });

        tick(1000);

        console.log('Running test assertions');
        expect(test).toBe(true);        
    }));


});