import { CalculatorService } from "./calculator.service"
import { LoggerService } from "./logger.service"
import {TestBed} from '@angular/core/testing';

describe('CalculatorService', () => {

    let calculator: CalculatorService,
        loggerSpy: any

    beforeEach(()=> {
        loggerSpy = jasmine.createSpyObj('LoggerService', ['log'])
        //calculator = new CalculatorService(loggerSpy)
        TestBed.configureTestingModule({
            providers: [
                CalculatorService,
                {provide: LoggerService, useValue: loggerSpy}
            ]
        })
        calculator = TestBed.inject(CalculatorService)
    })

    it('should add two numbers', () => {
        //const logger = new LoggerService()
        //spyOn(logger, 'log')
        const result = calculator.add(2,2)
        expect(result).toBe(4)
        expect(loggerSpy.log).toHaveBeenCalledTimes(1)
    })

    it('should substract two numbers', () => {        
        const result = calculator.subtract(5,2)
        expect(result).toBe(3, "unexpected subtraction result")
    })
})