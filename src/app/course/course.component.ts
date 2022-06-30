import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Course} from "../model/course";
import {
    debounceTime,
    distinctUntilChanged,
    startWith,
    tap,
    delay,
    map,
    concatMap,
    switchMap,
    withLatestFrom,
    concatAll, shareReplay
} from 'rxjs/operators';
import {merge, fromEvent, Observable, concat, forkJoin} from 'rxjs';
import {Lesson} from '../model/lesson';
import { createHttpObservable } from '../common/util';
import { debug, RxJsLoggingLevel, setRxjsLoggingLevel } from '../common/degub';


@Component({
    selector: 'course',
    templateUrl: './course.component.html',
    styleUrls: ['./course.component.css']
})
export class CourseComponent implements OnInit, AfterViewInit {
    courseId:string;

    course$: Observable<Course>;
    lessons$: Observable<Lesson[]>; 


    @ViewChild('searchInput', { static: true }) input: ElementRef;

    constructor(private route: ActivatedRoute) {


    }

    ngOnInit() {

        this.courseId = this.route.snapshot.params['id'];
        const courses$ = createHttpObservable(`/api/courses/${this.courseId}`);
        const lessons$ = this.loadLessons();

        forkJoin(courses$, lessons$).pipe
        (
            tap(([course, lessons]) => {
                console.log('course', course);
                console.log('lessons', lessons)
            })
        ).subscribe();
     /*   this.course$ = createHttpObservable(`/api/courses/${this.courseId}`)
            .pipe(
                debug(RxJsLoggingLevel.DEBUG, "course value ",)
            );
            setRxjsLoggingLevel(RxJsLoggingLevel.DEBUG)*/
    }

    ngAfterViewInit() {
     
            const initialLessons$ = this.loadLessons();
            this.lessons$ = fromEvent<any>(this.input.nativeElement, 'keyup')
            .pipe(
                map(event =>  event.target.value),
                startWith(''),
                debug(RxJsLoggingLevel.INFO, "search ",),
                debounceTime(400),
                distinctUntilChanged(),
                switchMap(search => this.loadLessons(search)),
                debug(RxJsLoggingLevel.DEBUG, "lessons value ",),

            )

    }

    loadLessons(search = ''): Observable<Lesson[]> {
        return createHttpObservable(`/api/lessons?courseId=${this.courseId}&pageSize=100&filter=${search}`)
        .pipe(
            map(res => res["payload"])
        );
    }


}
