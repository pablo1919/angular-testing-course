import { fakeAsync, flush, flushMicrotasks, tick } from "@angular/core/testing"
import { of } from "rxjs"
import { delay } from "rxjs/operators"

describe("ejemplos asincrónicos", () => {

    it('test asyncrono con Jasmine done()', (done:DoneFn) => {
        let test = false
        setTimeout(()=>{
            console.log('running assertions')
            test = true
            expect(test).toBeTruthy()
            done()
        }, 1000)
    })

    it('test asyncrono con fakeAsync', fakeAsync(() => {
        /**
         * fakeAsync() detecta todas las operaciones asíncronas que haya en el código que se le pasa
         * flush() hace que finalicen todos los asincronismos, ej setTimeout(). De lo contrario el test se ejecuta pero falla
         * xq expect() se evalúa antes de que llegue la respuesta
         */
        let test = false
        setTimeout(()=>{})
        setTimeout(()=>{
            console.log('running assertions fakeAsync()')
            test = true
        }, 1000)
        
        flush() //tick(1000)
        expect(test).toBeTruthy()
    }))

    /**
     * setTimeout(), setInterval(), peticiones Ajax, clic del mouse, son macro tasks o simplemente una tasks. 
     * Son agregados al event loop y entre cada task, el motor de renderizado del navegador tiene chance de actualizar la pantalla.
     * 
     * promise() es una microtask. promises tienen una cola de ejecución diferente a la de las tasks en el runtime de JavaScript. 
     * Entre la ejecución de 2 microtasks, el navegador no tiene chance de actualizar la vista.
     * 
     * El navegador ejectuta primero lo que haya en la cola de micro tasks, y luego lo de la macro tasks.
     *  
     * En el siguiente ej se ejecutan primero los console.log, luego las Promises, y luego los setTimeout. El testeo falla.
     */
    xit('test asyncrono - plain Promise', () => {
        let test = false
        console.log('creando Promise')

        setTimeout(()=>{
            console.log('setTimeout() primer callback triggered')
        })
        setTimeout(()=>{
            console.log('setTimeout() segundo callback triggered')                
        }, 1000)

        Promise.resolve().then(()=> {
            console.log('primer Promise() evaluada correctamente')
            return Promise.resolve()
        })
            .then(()=> {
                console.log('segunda Promise() evaluada correctamente')
                test = true
            })
        
        console.log('running test assertions')
        expect(test).toBeTruthy()
    })

    it('test asyncrono - plain Promise', fakeAsync(() => {
        let test = false
        console.log('creando Promise')
        Promise.resolve().then(()=> {
            console.log('primer Promise() evaluada correctamente')
            return Promise.resolve()
        })
            .then(()=> {
                console.log('segunda Promise() evaluada correctamente')
                test = true
            })

        flushMicrotasks()
        console.log('running test assertions')
        expect(test).toBeTruthy()
    }))

    it('test asyncrono - Promises + setTimeout()', fakeAsync(() => {
        let i = 0        
        Promise.resolve().then(()=> {
            i+=10
            setTimeout(()=> {
                i+=1
            }, 1000)
        })
        
        expect(i).toBe(0)
        flushMicrotasks()
        expect(i).toBe(10)
        tick(500)
        expect(i).toBe(10)
        tick(500)
        expect(i).toBe(11)
    }))

    it('test asyncrono - Observable', fakeAsync(()=> {
        let test = false
        console.log('creando Observable')
        const obs$ = of(test).pipe(delay(1000))
        obs$.subscribe(()=> {
            test = true
        })
        tick(1000)
        console.log('running test assertions')
        expect(test).toBeTruthy()
    }))
})