import {async, ComponentFixture, fakeAsync, flush, flushMicrotasks, TestBed, tick, waitForAsync} from '@angular/core/testing';
import {CoursesModule} from '../courses.module';
import {DebugElement} from '@angular/core';

import {HomeComponent} from './home.component';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {CoursesService} from '../services/courses.service';
import {HttpClient} from '@angular/common/http';
import {COURSES} from '../../../../server/db-data';
import {setupCourses} from '../common/setup-test-data';
import {By} from '@angular/platform-browser';
import {of} from 'rxjs';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {click} from '../common/test-utils';
//import { Test } from 'mocha';




describe('HomeComponent', () => {

  let fixture: ComponentFixture<HomeComponent>;
  let component:HomeComponent;
  let el: DebugElement;
  let coursesService: any
  const beginnerCourses = setupCourses().filter(c => c.category == 'BEGINNER')
  const advancedCourses = setupCourses().filter(c => c.category == "ADVANCED")

  /**
   * waitForAsync() detecta todas las operaciones asíncronas. No se puede usar flush() entonces no se tiene total control sobre la finalización de las tasks y microtasks
   * callback fixture.whenStable() notifica cuando todas las operaciones asíncronas están completas
   * no permite escribir las assertions en forma asíncrónica
   * no permite controlar el paso del tiempo
   * soporta http request (fakeAsync no), útil para tests de integración
   * En general se usa principalmente en beforeEach para la inicialización de componentes.
   */
  beforeEach(waitForAsync( () => {
    const coursesServiceSpy = jasmine.createSpyObj('CoursesService', ['findAllCourses'])
    TestBed.configureTestingModule({
      imports: [
        CoursesModule,
        NoopAnimationsModule /** simula la animación que hay al cliquear en un Tab, pero no la ejecuta */
      ],
      providers: [
        {provide: CoursesService, useValue: coursesServiceSpy}
      ]
    })
    .compileComponents()
    .then(()=> {
      fixture = TestBed.createComponent(HomeComponent)
      component = fixture.componentInstance
      el = fixture.debugElement
      coursesService = TestBed.inject(CoursesService)
    })
  }));


  it("should create the component", () => {
    expect(component).toBeTruthy();
  });


  it("should display only beginner courses", () => {
    coursesService.findAllCourses.and.returnValue(of(beginnerCourses)) 
    /**  of() devuele un observable a partir del array de Courses. Emite el valor inmediatamente.
     *   Esto es xq findAllCourses() devuelve un Observable, y no un Array.
     *   A pesar que findAllCourses es asíncrono, todo se ejecuta sincrónicamente 
     */
    fixture.detectChanges()
    const tabs = el.queryAll(By.css('.mdc-tab__text-label'))
    expect(tabs.length).toBe(1, "Se encontró una cantidad inesperada de tabs")

  });


  it("should display only advanced courses", () => {
    //advancedCourses.forEach(c => console.log(c.titles.description + '-' + c.category))
    coursesService.findAllCourses.and.returnValue(of(advancedCourses))
    fixture.detectChanges()
    const tabs = el.queryAll(By.css('.mdc-tab__text-label'))
    expect(tabs.length).toBe(1, "Se encontró una cantidad inesperada de tabs")
  });


  it("should display both tabs", () => {    
    coursesService.findAllCourses.and.returnValue(of(setupCourses()))
    fixture.detectChanges()
    const tabs = el.queryAll(By.css('.mdc-tab__text-label'))
    expect(tabs.length).toBe(2, "No se encontraron 2 tabs")
  });


  /** done Jasmine callback indica que es un test asincrónico, y que va a ser ejecutado cada vez que el test sincrónico esté completado.
  * Jasmine no va a considerar que el test se completó cuando se ejecute todo el bloque de código.
  */
  xit("should display advanced courses when tab clicked", (done: DoneFn) => { 
    coursesService.findAllCourses.and.returnValue(of(setupCourses()))
    fixture.detectChanges()
    const tabs = el.queryAll(By.css('.mdc-tab__text-label'))
    console.log(tabs)

    //click(tabs[1]) no funcionó
    tabs[1].nativeElement.click()
    fixture.detectChanges()

    /** El componente mat-tab-group usa internamente una animación que demora 16ms en ejecutarse, y hace que detectChanges falle, 
     por eso hay que agregar un delay para que se ejecute. */    
    setTimeout(()=> { /** setTimeout es una operación asíncrona. No es la mejor forma de implementar un test asíncrono */
      fixture.detectChanges()
      const cardTitles = el.queryAll(By.css('.mat-mdc-card-title'))
      console.log(cardTitles[0].nativeElement.outerHTML)
      expect(cardTitles.length).toBeGreaterThan(0, "No pudo encontrar card titles")
      expect(cardTitles[0].nativeElement.textContent).toContain('Angular Security Course')
      done() /* indica que el test asincrónico está completado */
    }, 500)

  });

  /** Mismo test que it anterior, pero usando fakeAsync() */
  it("should display advanced courses when tab clicked - fakeAsync()", fakeAsync(() => { 
    coursesService.findAllCourses.and.returnValue(of(setupCourses()))
    fixture.detectChanges()
    const tabs = el.queryAll(By.css('.mdc-tab__text-label'))
    console.log(tabs)
   
    tabs[1].nativeElement.click()
    console.log('tab cliqueada: '+ tabs[1].nativeElement.innerText)
    fixture.detectChanges()

    /** El componente mat-tab-group usa internamente una animación que demora 16ms en ejecutarse */
    flush() /* hace que finalice la animación al cambiar de tab)*/
    fixture.detectChanges() /* detecta los cambios hechos por la animación */
    const cardTitles = el.queryAll(By.css('.mat-mdc-card-title'))    
    console.log(cardTitles[0].nativeElement.outerHTML)
    expect(cardTitles.length).toBeGreaterThan(0, "No pudo encontrar card titles")
    expect(cardTitles[0].nativeElement.textContent).toContain('Angular Security Course')
  }));

  /** Mismo test que it anterior, pero usando async() */
  it("should display advanced courses when tab clicked - async()", async(() => { 
    coursesService.findAllCourses.and.returnValue(of(setupCourses()))
    fixture.detectChanges()
    const tabs = el.queryAll(By.css('.mdc-tab__text-label'))
    tabs[1].nativeElement.click()
    fixture.detectChanges()

    fixture.whenStable().then(()=> {
      console.log('llamando a whenStable')
      fixture.detectChanges()
      const cardTitles = el.queryAll(By.css('.mat-mdc-card-title'))    
      expect(cardTitles.length).toBeGreaterThan(0, "No pudo encontrar card titles")
      expect(cardTitles[0].nativeElement.textContent).toContain('Angular Security Course')  
    })
  }));

});


