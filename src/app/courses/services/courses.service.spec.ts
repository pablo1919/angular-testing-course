import { TestBed } from '@angular/core/testing'
import { CoursesService } from './courses.service'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { COURSES, findLessonsForCourse } from '../../../../server/db-data'
import { Course } from '../model/course'
import { HttpErrorResponse } from '@angular/common/http'

describe('CoursesService', () => {
    let coursesService: CoursesService,
        httpTestingController: HttpTestingController

    /* crea instancias de CoursesService */
    beforeEach(()=> {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [CoursesService]
        })
        coursesService = TestBed.inject(CoursesService)
        httpTestingController = TestBed.inject(HttpTestingController)
    })

    it('should find all courses', () => {
        coursesService.findAllCourses().subscribe(
            courses => {
                expect(courses).toBeTruthy('No se devolvieron cursos') /*verifica que no devuelva null, undefined, etc */
                expect(courses.length).toBe(12, 'cantidad incorrecta de cursos')
                const course = courses.find(c => c.id == 12)
                expect(course.titles.description).toBe('Angular Testing Course')
            })
        /** mock http request */
        const req = httpTestingController.expectOne('/api/courses') /* GET request */
        expect(req.request.method).toEqual('GET')
        req.flush({payload: Object.values(COURSES)})        
    })

    it('debería encontrar un curso por id', () => {
        coursesService.findCourseById(12).subscribe(
            course => {
                expect(course).toBeTruthy()
                expect(course.id).toBe(12)
        })
        const req = httpTestingController.expectOne('/api/courses/12')
        expect(req.request.method).toEqual('GET')
        req.flush(COURSES[12])
    })

    it('debería guardar datos de un curso', () => {
        const changes: Partial<Course> = {titles: {description: 'Angular Testing Course'}}
        coursesService.saveCourse(12, changes).subscribe(
            course => {
                expect(course.id).toBe(12)
        })
        const req = httpTestingController.expectOne('/api/courses/12')
        expect(req.request.method).toEqual("PUT")
        req.flush({
            ...COURSES[12],
            ...changes
        })
    })

    it('debería dar error si falla al guardar un curso', () => {
        const changes: Partial<Course> = {titles: {description: 'Angular Testing Course'}}
        coursesService.saveCourse(12, changes).subscribe(
            () => fail('la operación saveCourse debería haber fallado'), 
            (error: HttpErrorResponse) => {
                expect(error.status).toBe(500)
            }
        )
        const req = httpTestingController.expectOne('/api/courses/12')
        expect(req.request.method).toEqual("PUT")
        req.flush('falló saveCourse', {status: 500, statusText: 'Internal server error'})
    })

    it('debería encontrar una lista de Lessons', () => {
        coursesService.findLessons(12)
            .subscribe(lessons => {
                expect(lessons).toBeTruthy()
                expect(lessons.length).toBe(3)
            })
        const req = httpTestingController.expectOne(req => req.url == '/api/lessons') /** se verifica diferente a los anteriores xq recibe parámetros */
        expect(req.request.method).toEqual("GET")
        expect(req.request.params.get('courseId')).toEqual('12')
        expect(req.request.params.get('filter')).toEqual('')
        expect(req.request.params.get('sortOrder')).toEqual('asc')
        expect(req.request.params.get('pageNumber')).toEqual('0')
        expect(req.request.params.get('pageSize')).toEqual('3')
        
        req.flush({
            payload: findLessonsForCourse(12).slice(0,3) 
        })
    })

    afterEach(()=> {
        httpTestingController.verify() /*verifica que solamente se ejecute un request en cada test */
    })
})