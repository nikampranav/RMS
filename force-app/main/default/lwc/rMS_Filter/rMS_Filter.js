import { LightningElement, track,wire  } from 'lwc';
import List_getJourneyClassOptions from '@salesforce/apex/RMS_MetadataService.List_getJourneyClassOptions';
import { CurrentPageReference } from 'lightning/navigation';
import { publish, MessageContext } from 'lightning/messageService';
import filter_Channel from '@salesforce/messageChannel/RMS_Message_Channel__c';

export default class MyComponent extends LightningElement {

@track str_journeyClassOptions = [];
@track value = 0;
Int_min = 0;
Int_max = 24;
Int_step = 1;
Int_departureValue = 0;
Int_arrivalValue = 0;
@track iconName1 = 'utility:chevrondown';
@track iconName2 = 'utility:chevrondown';
@track iconName3 = 'utility:chevrondown';
@track iconName4 = 'utility:chevrondown';

/* Page Reference Parameter */

@wire(CurrentPageReference)
getPageReferenceParameters(currentPageReference) {
if (currentPageReference) {
console.log('search result pageref: ', currentPageReference);
 
let state = currentPageReference.attributes.state;
console.log('state: ',JSON.stringify(currentPageReference.attributes.state));
this.strFromStation = state ? state.RMS_fromStation : ''
this.strToStation = state ? state.RMS_ToStation : ''
this.selectedDate = state ? state.RMS_Date : ''
this.coachValue = state ? state.RMS_Coach : ''
}
}

/* handle the change of departure time */
handleChangeDeparture(event) {
this.Int_departureValue = event.target.value;

}

/* handle the change of arrival time */
handleChangeArrival(event) {
this.Int_arrivalValue = event.target.value;

}

@track str_trainTypeOptions = [
{ label: 'Train Type', isChecked: false }
];

@track bln_isJourneyClassGridVisible = true;
@track bln_isTrainTypeGridVisible = true;
@track bln_isTrainTimeGridVisible = true;
@track bln_isTrainArrivalGridVisible = true;

/* select all function for str_journeyClassOptions and str_trainTypeOptions */
selectAllJourneyClass() {
this.str_journeyClassOptions = this.str_journeyClassOptions.map(option => ({ ...option, isChecked: true }));
}

selectAllTrainType() {
this.str_trainTypeOptions = this.str_trainTypeOptions.map(option2 => ({ ...option2, isChecked: true }));
}

/* toggle for journey class */
toggleJourneyClassGrid() {
this.bln_isJourneyClassGridVisible = !this.bln_isJourneyClassGridVisible;
this.iconName1 = this.iconName1 === 'utility:chevrondown' ? 'utility:chevronup' : 'utility:chevrondown';
}

/* toggle for Train type */
toggleTrainTypeGrid() {
this.bln_isTrainTypeGridVisible = !this.bln_isTrainTypeGridVisible;
this.iconName2 = this.iconName2 === 'utility:chevrondown' ? 'utility:chevronup' : 'utility:chevrondown';
}

/* toggle for Train Departure */
toggleTrainTimeGrid() {
this.bln_isTrainTimeGridVisible = !this.bln_isTrainTimeGridVisible;
this.iconName3 = this.iconName3 === 'utility:chevrondown' ? 'utility:chevronup' : 'utility:chevrondown';
}

/* toggle for Train Arrival */
toggalTrainArrivalGrid(){
console.log("In toggle");
this.bln_isTrainArrivalGridVisible = !this.bln_isTrainArrivalGridVisible;
this.iconName4 = this.iconName4 === 'utility:chevrondown' ? 'utility:chevronup' : 'utility:chevrondown';
}

handleJourneyClassCheckbox(event){
   console.log("checkbox event", event);
   console.log("Event: ", event.currentTarget);

   this.str_journeyClassOptions = this.str_journeyClassOptions.map((item)=>{
    if(item.label===event.target.dataset.title){
        return {label:item.label,isChecked:event.target.checked}
    }
    else {
        return item;
    }
   })
   console.log("journey options",JSON.stringify(this.str_journeyClassOptions));
   this.publishJourneyClassOptions();
}
/**
* @ author       :  Nikam Pranav  
* @ description  :  The List_getJourneyClassOptions fetch the classes.
**/

@wire(MessageContext)
 context;

connectedCallback() {
List_getJourneyClassOptions()
.then(result => {
    this.str_journeyClassOptions = this.coachValue
    this.str_journeyClassOptions = result.map(option => { 
        console.log(this.coachValue)
        return {
            label: option, 
            isChecked: this.coachValue === 'All Classes' || option === this.coachValue
        }
    });
     // Publish the journey class options to the message channel
     this.publishJourneyClassOptions();
})
.catch(error => {
    /* Handle the error */
    console.error(error);
});
}

// Publish the journey class options to the message channel
    publishJourneyClassOptions() {
        const message = {
            journeyClassOptions: JSON.stringify(this.str_journeyClassOptions) // Convert to JSON string
        };
        publish(this.context, filter_Channel, message);
    }


get firstTwoJourneyClassOptions() {
return this.str_journeyClassOptions.slice(0, 4);
}

get lastTwoJourneyClassOptions() {
return this.str_journeyClassOptions.slice(4);
}


changeColor(event) {
if (event.target.style.backgroundColor === 'gray') {
event.target.style.backgroundColor = 'rgb(14, 14, 109)';
} else {
event.target.style.backgroundColor = 'gray';
}
 // Get the selected departure time range from the clicked button
 const buttonContent = event.target.textContent.trim();
 const departureTimeRange = buttonContent.split('<br>')[0]; // Extract the time range

 // Call publishDepartureTimeOptions method to update departureTimeOptions
 this.publishDepartureTimeOptions(departureTimeRange);
 this.publishArrivalTimeOptions(arrivalTimeRange);
}

// Publish the departure time options to the message channel
publishDepartureTimeOptions(selectedDepartureTimeRange) {
    const message = {
        departureTimeOptions: selectedDepartureTimeRange // Use the selected departure time range directly
    };
    publish(this.context, filter_Channel, message);
}

// Publish the arrival time options to the message channel
publishArrivalTimeOptions(selectedArrivalTimeRange) {
    const message = {
        departureTimeOptions: selectedArrivalTimeRange // Use the selected departure time range directly
    };
    publish(this.context, filter_Channel, message);
}



/*  functions for select all departure button */
selectAllDeparture() {
let buttons = this.template.querySelectorAll('.departure-button');
console.log('Button: ', buttons);
buttons.forEach(button => {
button.style.backgroundColor = 'rgb(14, 14, 109)';
button.style.color = 'rgb(255, 255, 255)';
});
}

/*  functions for select all arrrival button */
selectAllArrival() {
let buttons = this.template.querySelectorAll('.arrival-button');
buttons.forEach(button => {
button.style.backgroundColor = 'rgb(14, 14, 109)';
button.style.color = 'rgb(255, 255, 255)';
});
}
}