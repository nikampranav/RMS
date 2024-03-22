import { LightningElement } from 'lwc';
//import RMS_Schedule from 'c/rMS_Schedule';
export default class Test_Screen extends LightningElement {
    async openModal(){
        const result = await RMS_Schedule.open({
            size:'medium',
            description:'Suni',
            heading:'SunimOn',
            
        })
        console.log(result)
    }
}