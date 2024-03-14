import { LightningElement, wire } from 'lwc';
import { unsubscribe, subscribe, MessageContext } from 'lightning/messageService';
import SAMPLE_MESSAGE_CHANNEL from '@salesforce/messageChannel/Sample_Message_Channel__c';
import { CurrentPageReference } from 'lightning/navigation';

export default class Component2 extends LightningElement {
RMS_inputValue = '';
RMS_fromStation;
RMS_ToStation 
RMS_Date 
RMS_Coach

@wire(MessageContext)
messageContext;

subscription;
@wire(CurrentPageReference)
getPageReferenceParameters(currentPageReference) {
    if (currentPageReference) {
        console.log('search result pageref: ', currentPageReference);
    //   let attributes = currentPageReference.attributes;
        let state = currentPageReference.attributes.state;
        console.log('state: ',JSON.stringify(currentPageReference.attributes.state));
        this.strFromStation = state ? state.RMS_fromStation : '';
        this.strToStation = state ? state.RMS_ToStation : ''
        this.selectedDate = state ? state.RMS_Date : ''
        this.coachValue = state ? state.RMS_Coach : ''
    }
    
}



connectedCallback() {
    
    // Subscribe to the message channel
    this.subscription = subscribe(this.messageContext, SAMPLE_MESSAGE_CHANNEL, (message) => {
        this.inputValue = message.inputValue;
    });
}

disconnectedCallback() {
    // Unsubscribe when the component is disconnected
    unsubscribe(this.subscription);
}
}