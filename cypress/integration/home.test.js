/**
 * iniciar: npm run cypress:open
 * Con Cypress se hacen peticiones http reales (a diferencia de angular test), se simula la respuesta
 * expect(true).to.equal(true)
 * 
 * Continuous integration environment -> Travis: genera reporte de completitud de test de los componentes de la app
 * 
    1 - Se debe ejecutar el siguiente comando, pero antes hay que definir la política de ejecución de scrips en powershell de Windows
        Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
        Get-ExecutionPolicy -Scope CurrentUser
        ng test --watch=false --code--coverage -> genera la carpeta "coverage" con el reporte
    2 - Instalar un servidor http
        npm install -g http-server  (-g == global)
    3 - cambiarse a "coverage" y ejecutar el servidor para ver el reporte
        cd coverage/
        http-server -c-1 . ("-c-1" == deshabilita todos los cache, "." == carpeta actual)
    4 - npm run start:prod -> testea contra el build de prducción en el puerto 4200
    5 - Ejecutar el test Cypress contra instancia de producción:
        a - en otra terminal: npm run cypress:run (verifica que haya una aplicación corriendo en :4200 e imprime en consola)
    6 - COMANDO QUE EJECUTE OPERACIONES 1 a 5
        npm run e2e

    TRAVIS
    https://travis-ci.org
 */


describe ('Página inicial', () => {

    beforeEach(() => {        
        cy.fixture('courses.json').as("coursesJSON")
        cy.server()
        cy.route('/api/courses', "@coursesJSON").as("cursos")
        cy.visit('/')
    })


    it ('Debería mostrar una lista de cursos', () => {

        cy.contains('All Courses')
        cy.wait('@cursos')
        cy.get("mat-card").should("have.length", 9)

    })

    it('debería mostrar los cursos avanzados', () => {

        cy.get('[id^=mat-tab-label]').should("have.length", 2) //tiene 2 tabs
        cy.get('[id^=mat-tab-label]').last().click() //clic en 2da tab
        cy.get('.mat-mdc-tab-body-active .mat-mdc-card-title').its('length').should('be.gt', 1) //la cantidad de títulos (de cursos) tiene que ser mayor a 1
        cy.get('.mat-mdc-tab-body-active .mat-mdc-card-title').first()
            .should('contain', "Angular Security Course") //el 1er curso es "Angular Sec ..."

    }) 
})