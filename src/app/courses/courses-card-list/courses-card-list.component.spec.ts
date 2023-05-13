import {async, ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {CoursesCardListComponent} from './courses-card-list.component';
import {CoursesModule} from '../courses.module';
import {COURSES} from '../../../../server/db-data';
import {DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {sortCoursesBySeqNo} from '../home/sort-course-by-seq';
import {Course} from '../model/course';
import {setupCourses} from '../common/setup-test-data';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

describe('CoursesCardListComponent', () => {
  
  let component: CoursesCardListComponent
  let fixture: ComponentFixture<CoursesCardListComponent> /** clase accesoria para crear una instancia ficticia de un componente */
  let el: DebugElement /** permite consultar sobre el DOM */

  beforeEach(waitForAsync( ()=> {
    TestBed.configureTestingModule({
      imports: [CoursesModule, MatDialogModule]
    })
    .compileComponents()
    .then(()=> {
      fixture = TestBed.createComponent(CoursesCardListComponent)
      component = fixture.componentInstance
      el = fixture.debugElement
    })
  }) )


  it("should create the component", () => {   
    expect(component).toBeTruthy()
  });


  it("should display the course list", () => {
    component.courses = setupCourses()
    fixture.detectChanges() /** dispara el mecanismo de detección de cambios de Angular */
    //console.log(el.nativeElement.outerHTML)

    const cards = el.queryAll(By.css(".course-card")) /** predicado: función que retorna true o false */
    expect(cards).toBeTruthy('No pudo encontrar cards')
    expect(cards.length).toBe(12, 'Cantidad inesperada de cards')
  });


  it("should display the first course", () => {
    component.courses = setupCourses()
    fixture.detectChanges()
    const course = component.courses[0] 
    const card = el.query(By.css('.course-card:first-child')),
          title = card.query(By.css('mat-card-title')),
          img = card.query(By.css('img'))

    expect(card).toBeTruthy('No se encontró ningún course card')
    expect(title.nativeElement.textContent).toBe(course.titles.description)
    expect(img.nativeElement.src).toBe(course.iconUrl)      

  });


});


