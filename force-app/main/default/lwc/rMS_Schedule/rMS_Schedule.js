import { LightningModal } from 'lightning/modal';
import { LightningElement,api } from 'lwc';


export default class RMS_Schedule extends LightningModal {
    @api content
    handleOkay(){
        this.close('okay');
    }
}