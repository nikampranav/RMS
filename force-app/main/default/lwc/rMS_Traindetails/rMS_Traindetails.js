import { LightningElement, wire, track } from 'lwc';
import List_getTrainDetails from '@salesforce/apex/RMS_TrainController.List_getTrainDetails';
import getAvailableSeats from '@salesforce/apex/RMS_CapacityController.getAvailableSeats';
import getAvailableDates from '@salesforce/apex/RMS_CapacityController.getAvailableDates';
import getTrainSchedules from'@salesforce/apex/RMS_MyJourneyController.getTrainSchedules';
import { CurrentPageReference,NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import LightningConfirm from 'lightning/confirm';

export default class RMS_Traindetail extends NavigationMixin(LightningElement) {
    @track dates = [];
    @track journey = [];
    @track str_TrainName;
    @track str_nameOfTrain;
    @track str_Coaches;
    @track int_capacity;
    @track str_error;
    @track int_AvailableSeats;
    @track int_coachesSeats;
    @track nameOfTrain;
    @track coachType;
    @track trainScheduleId;
    @track strFromStation = '';
    @track strToStation = '';
    @track selectedDate = '';
    @track str_trainId = '';
    @track rms_coaches;
    @track activeTab = '';
    @track strFromSch = '';
    @track strToSch = '';
    @track selectedCoach = '';
    @track datesWithCapacity = [];
    @track showModal = false;
    @track showModalBackdrop = false;
    @track seats = {};
    @track rms_coaches = [];
    seats;
    RMS_Coach;

    get capacityValue() {
        console.log('capacity available => ',)
        return this.capacity ? this.capacity : 'Available';
    }


    setCoachType(e){
        console.log('setcoachtype', e.target.value);
        this.coachType = e.target.value;
    }



/* wire function property to fetch search record based on user input*/
@wire(List_getTrainDetails, { trainName: '$nameOfTrain' })
wiredTrain({ error, data }) {
if (data) {
console.log('data: wiredTrain', data);
this.str_trainName = data.Name; 
this.str_trainId = data.Id;
this.strFromSch = data.RMS_Starting__c;
this.strToSch = data.RMS_Destination__c;
this.str_Coaches = data.RMS_Coach__c.split(';');
this.rms_coaches = data.RMS_Coach__c.split(';').map((item) => {
return { 
int_coachName: item
}
}); 

console.log('coaches value =>>> '+this.str_Coaches)

this.int_AvailableSeats = data.RMS_Available_Seats__c;
this.str_error = undefined;
} else if (error) {
console.log('error=>' +JSON.stringify(error));
this.str_error = error;
this.str_TrainName = undefined;
this.str_Coaches = undefined;
this.int_AvailableSeats = undefined;
}
}

handleTabChange(event) {
    this.activeTab = event.target.label;
    this.selectedCoach = event.target.value;
    console.log('Selected Coach:', this.selectedCoach);

    //Call the Apex method
    getAvailableDates({ scheduledDate: this.selectedDate, trainScheduleId: this.trainScheduleId, fromStation: this.strFromStation, toStation: this.strToStation, coachName: this.selectedCoach })
    
    .then(result => {
        // Process the result
        console.log("Seats Result: ", result);
        this.seats = result;
        // this.updateDatesWithCapacity();
    })
    .catch(error => {
        // Handle the error
        console.error(error);
    });
}



updateDatesWithCapacity() {
    // Ensure this.seats.data is an array of CoachWrapper objects from Apex
    console.log('Seats Data:', this.seats.data);
    if (!this.seats.data){
        return;
    }
    const coachInfo = this.seats.data.find(coachData => coachData.int_coachName === this.selectedCoach);
  
    console.log('Coach Info:', coachInfo);

    // Check if coachInfo is found
    if (coachInfo && coachInfo.coaches) {
        this.datesWithCapacity = this.dates.map(date => {
            const coach = coachInfo.coaches.find(coach => coach.RMS_ScheduledDate__c === date);
            return { date, capacity: coach ? coach.RMS_Capacity__c : 0 };
        });

        console.log('Dates with Capacity:', this.datesWithCapacity);

        // Rerender the component to reflect the changes
        // this.template.querySelector('iter').rerender();
    } else {
        this.datesWithCapacity = [];
        console.log('Coach Info not found. Dates with Capacity:', this.datesWithCapacity);
    }
}



displayCapacity() {
if (this.capacity > 0) {
console.log(`The train has a capacity of ${this.capacity} passengers.`);
} else {
console.log('The train is currently not in service.');
}
}

navigateSchedulePage(){
if(this.strFromStation && this.strToStation && this.selectedDate && this.str_trainId)
{
    this[NavigationMixin.Navigate]({
        type: 'standard__navItemPage',
        attributes: {
            apiName:"RMS_TrainScheduleDetails",
            state: {
            RMS_fromStation: this.strFromSch,
            RMS_ToStation: this.strToSch,
            RMS_Date: this.selectedDate,
            RMS_trainId: this.str_trainId,
            
            }   
        }
    });
}
else{
    console.log('Not all values populated from Navigation Mixing')
}
}

/**
* @ author       :  Nikam Pranav  
* @ description  :  The getTrainSchedules method is used to calculate and return the details of a journey.
**/

@wire(CurrentPageReference)
getPageReferenceParameters(currentPageReference) {
if (currentPageReference) {
console.log('search result pageref: ', currentPageReference);
//   let attributes = currentPageReference.attributes;
let state = currentPageReference.attributes.state;
console.log('state: ',JSON.stringify(currentPageReference.attributes.state));
this.strFromStation = state ? state.RMS_fromStation : this.strFromStation;
this.strToStation = state ? state.RMS_ToStation : this.strToStation
this.selectedDate = state ? state.RMS_Date : this.selectedDate
this.coachValue = state ? state.RMS_Coach : this.coachValue
}
console.log('prev page data :', this.selectedDate,this.strFromStation,this.strToStation);
}



@wire(getTrainSchedules ,{fromStation: '$strFromStation', toStation:'$strToStation', journeyDate:'$selectedDate'}) 
wiredJourney({ error, data }) {

if (data) {
console.log("Data: wiredourney", data);
this.nameOfTrain = data[0].RMS_Train__r.Name
this.trainScheduleId = data[0].Id;

console.log('data . ',data[0].Id);
this.journey = data.map(item => ({
    ...item,
    RMS_DepartureTimeFrom__c: this.formatTime(item.RMS_DepartureTimeFrom__c),
    RMS_ArrivalTimeTo__c: this.formatTime(item.RMS_ArrivalTimeTo__c),
    
}));
console.log('Journey: ', JSON.parse(JSON.stringify(this.journey)));
} else if (error) {
console.error("An error occurred while fetching train schedules: ", (error));
}
}

formatTime(timeString) {

let date = new Date(timeString);
let hours = date.getUTCHours();
let minutes = date.getUTCMinutes();
if (minutes < 10){
minutes='0'+minutes;
}
console.log('hours and minutes: ',hours,' ',minutes );
let formattedTime = hours + ":" + minutes;
if(!hours && !minutes){
return "__:__"
}  
console.log('formatted time', formattedTime);
return formattedTime
}




get seatInfo() {
    let seatInfo = [];

    seatInfo = this.seats?.map((item) => {
        return {
            date: `${this.format(item.RMS_ScheduledDate__c)}, ${item.RMS_ScheduledDate__c}`,
            capacity: item.RMS_Capacity__c
        }
    })

    return seatInfo;
}

format(dateValue) {
    let date = new Date(dateValue);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return days[date.getDay()];
}

formatDate(dateString) {
if (typeof dateString !== 'string') {
    return 'Invalid Date';
}

const [year, month, day] = dateString.split('-');

// Month is 0-indexed in JavaScript, so we subtract 1
const date = new Date(year, month - 1, day);

if (isNaN(date.getTime())) {
    return 'Invalid Date';
}

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const currentDate = String(date.getDate()).padStart(2, '0');

const formattedDate = `${days[date.getDay()]}-${currentDate}-${date.getFullYear()}`;

return formattedDate;
}



getnextSevenDays() {
let dates = [];
const cst_days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const cst_months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

for (let i = 0; i < 7; i++) {
    const cst_date = new Date(); // Create a new date object for each iteration
    cst_date.setDate(cst_date.getDate() + i);

    let dayname = cst_days[cst_date.getDay()];
    let day = cst_date.getDate();
    let month = cst_months[cst_date.getMonth()];
    dates.push(dayname + ', ' + day + ' ' + month);
}

return dates;
}








handleBlockClick(event) {
    console.log("handleBlockClick executed");
if (event.target.classList.contains('date-block')) {
    
    event.target.classList.toggle('blue-background');
}
}

async handleConfirmClick() {
    const result = await LightningConfirm.open({
        message: `You searched trains for Date ${this.selectedDate}  from ${this.strFromStation} to ${this.strToStation} and the train is ${this.str_trainName},also the coach is ${this.coachValue} Do you want to continue with it?`,
        variant: 'header',
        label: 'Confirmation',
        theme: 'info'
    });


    if(result) {
        // Show a success toast message
        const event = new ShowToastEvent({
            title: 'Success!',
            message: 'Thank you for booking.',
            variant: 'success',
        });
        this.dispatchEvent(event);
    } else {
        const event = new ShowToastEvent({
        title: 'Cancelled',
        message: 'Booking process cancelled.',
        variant: 'error',
        });
        this.dispatchEvent(event);
    }
}




}

// AND Id IN (SELECT Train_Schedule__c FROM RMS_Coach__c)

// class="main-card" padding="around-medium"

//AND Id IN (SELECT Train_Schedule__c FROM RMS_Coach__c)
//AND RMS_Date__c!= null



// List<Date> distinctScheduledDates = new List<Date>();
// for (AggregateResult ar : [SELECT MIN(RMS_ScheduledDate__c) minDate FROM RMS_Coach__c WHERE Train_Schedule__c = :trainScheduleId GROUP BY Train_Schedule__c]) {
//     distinctScheduledDates.add((Date)ar.get('minDate'));
// }




//AND Name IN :coachCapacityMap.keySet()