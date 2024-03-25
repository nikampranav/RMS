import { LightningElement, wire, track } from 'lwc';
import List_getTrainDetails from '@salesforce/apex/RMS_TrainController.List_getTrainDetails';
import getAvailableDates from '@salesforce/apex/RMS_CapacityController.getAvailableDates';
import getTrainSchedules from'@salesforce/apex/RMS_MyJourneyController.getTrainSchedules';
import { CurrentPageReference,NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import BookingModal from 'c/rMS_BookingModal'
import { subscribe, MessageContext, unsubscribe,APPLICATION_SCOPE } from 'lightning/messageService';
import filter_Channel from '@salesforce/messageChannel/RMS_Message_Channel__c';
import PassModal from 'c/passModal';
import LightningConfirm from 'lightning/confirm';

export default class RMS_Traindetail extends NavigationMixin(LightningElement) {
    @track isLoading = true; 
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
    @track coachValue;
    @track datesWithCapacity = [];
    @track showModal = false;
    @track showModalBackdrop = false;
    @track seats = {};
    @track rms_coaches = [];
    @track distance;
    @track ticketPrice;
    seats;
    RMS_Coach;
    journeyClassOptions = [];
    availableCoaches = [];
    isVisible = true; 
    subscription=null;
    
    @wire(MessageContext)
    messageContext;

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

this.subscription = subscribe(
    this.messageContext,
    filter_Channel,
    (message) => {
        this.handleMessage(message);
    }
);
} else if (error) {
console.log('error=>' +JSON.stringify(error));
this.str_error = error;
this.str_TrainName = undefined;
this.str_Coaches = undefined;
this.int_AvailableSeats = undefined;
}
}

handleMessage(message){
    console.log("In Handle Message");
        //console.log("message", message);
        this.filterMessage=message;
        if (message && message.journeyClassOptions) {
              
                 console.log('Received journeyClassOptions:', message.journeyClassOptions);
        
                       this.journeyClassOptions = JSON.parse(message.journeyClassOptions); // Convert JSON string to object
        
        
                   // Get train details based on the train name
                     if (this.str_trainName && this.str_Coaches) {
                        // Log train name and coaches
                       console.log('Train name:', this.str_trainName);
                       console.log('Coaches:', JSON.stringify(this.str_Coaches));
        

                        // Check if any selected journey class option is not available in the available coaches
                        const lastOption = this.journeyClassOptions.slice().reverse().find(option => option.label === 'All Classes' && option.isChecked);
                        // Check if any selected journey class option is not available in the available coaches
                         if (this.journeyClassOptions.some(option => {
                            if(option.isChecked){
                                return this.str_Coaches.includes(option.label);
                            }
                            return false;
                         }) || lastOption){
                            this.isVisible = true;
                        } else {
                            this.isVisible = false;
                        }
                    } else {
                         console.log('Train details are not yet available.');
                    }
               
                 } else if (message && message.departureTimeOptions) {
                    console.log('Received departureTimeOptions:', message.departureTimeOptions);
            
                    // Get the arrival and departure times from the train schedule
                    
                    const departureTime = this.journey.map(item => item.RMS_DepartureTimeFrom__c);
                    console.log('Train departure time:',departureTime);
                    // Extract the time range from the clicked button
                    const clickedButtonTimeRange = message.departureTimeOptions;
                     // Extract start and end times from the clicked button time range
                    const startBlock = clickedButtonTimeRange.split('-')[0]; // Extracting '18.00'
                    const endBlock = clickedButtonTimeRange.split('-')[1].replace(/[^0-9]/g, ''); // Extracting '24'

                   // Log the formatted departureTimeOptions
                    console.log('Formatted departureTimeOptions:', startBlock, endBlock);
                    
            
                    // Check if the clicked button time range matches the arrival or departure time
                    const isWithindepartureRange = departureTime.some(departureTime => {
                        const [hours, minutes] = departureTime.split(':').map(Number); // Convert hours and minutes to numbers
                        const departureNumerical = hours * 100 + minutes; // Convert departure time to numerical value
                    
                        // Convert start and end times to numerical values for comparison
                        const startNumerical = parseInt(startBlock.replace('.', ''));
                        const endNumerical = parseInt(endBlock);
                    
                    
                        // Check if the departure time falls within the range
                        const result = departureNumerical >= startNumerical && departureNumerical <= endNumerical;
                        console.log('Result:', result);
                        return result;
                    });
                    
                    // Set isVisible based on whether any departure time falls within the range
                    console.log('Is within range:', isWithindepartureRange);
                    this.isVisible = isWithindepartureRange;
                } else if (message && message.arrivalTimeOptions) {
                    console.log('Received arrivalTimeOptions:', message.arrivalTimeOptions);
            
                    // Get the arrival and departure times from the train schedule
                    
                    const arrivalTime = this.journey.map(item => item.RMS_ArrivalTimeTo__c);
                    console.log('Train arrival time:',arrivalTime);
                    // Extract the time range from the clicked button
                    const clickedButtonTimeRanges = message.arrivalTimeOptions;
                     // Extract start and end times from the clicked button time range
                    const startBlock = clickedButtonTimeRanges.split('-')[0]; 
                    const endBlock = clickedButtonTimeRanges.split('-')[1].replace(/[^0-9]/g, ''); 

                   // Log the formatted departureTimeOptions
                    console.log('Formatted arrivalTimeOptions:', startBlock, endBlock);
            
                    // Check if the clicked button time range matches the arrival or departure time
                    const isWithinArrivalRange = arrivalTime.some(arrivalTime => {
                        const [hours, minutes] = arrivalTime.split(':').map(Number); // Convert hours and minutes to numbers
                        const arrivalNumerical = hours * 100 + minutes; // Convert arrivaltime to numerical value
                    
                        // Convert start and end times to numerical values for comparison
                        const startNumerical = parseInt(startBlock.replace('.', ''));
                        const endNumerical = parseInt(endBlock);
                    
                        // Check if the departure time falls within the range
                        const result = arrivalNumerical >= startNumerical && arrivalNumerical <= endNumerical;
                        console.log('Result:', result);
                        return result;
                    });
                    
                    // Set isVisible based on whether any departure time falls within the range
                    console.log('Is within range:', isWithinArrivalRange);
                    this.isVisible = isWithinArrivalRange;
                }

                 console.log("After handling");
                 console.log("isvisble check",this.isVisible);
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
        this.isLoading = false;

        // Rerender the component to reflect the changes
        // this.template.querySelector('iter').rerender();
    } else {
        this.datesWithCapacity = [];
        console.log('Coach Info not found. Dates with Capacity:', this.datesWithCapacity);
        this.isLoading = false;
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
    
    console.log('Inside Button Trigger '+ this.strFromStation + this.strToStation)
if(this.strFromStation && this.strToStation && this.selectedDate && this.str_trainId)
{
    const value = {
        RMS_fromStation: this.strFromStation,
        RMS_ToStation: this.strToStation,
        RMS_Date: this.selectedDate,
        RMS_trainId: this.str_trainId,
        RMS_TrainName: this.nameOfTrain
    }
    PassModal.open({
        size:'medium',
        label:'Hey There',
        values:value
    })
    .catch((error)=>{
        console.log('Error is',JSON.stringify(error))
    })
    // this[NavigationMixin.Navigate]({
    //     type: 'standard__navItemPage',
    //     attributes: {
    //         apiName:"RMS_TrainScheduleDetails",
    //         state: {
    //         RMS_fromStation: this.strFromStation,
    //         RMS_ToStation: this.strToStation,
    //         RMS_Date: this.selectedDate,
    //         RMS_trainId: this.str_trainId,
            
    //         }   
    //     }
    // });
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
this.isLoading = false;

console.log('data . ',data[0].Id);
this.journey = data.map(item => ({
    ...item,
    RMS_DepartureTimeFrom__c: this.formatTime(item.RMS_DepartureTimeFrom__c),
    RMS_ArrivalTimeTo__c: this.formatTime(item.RMS_ArrivalTimeTo__c),
    
    
}));
console.log('Journey: ', JSON.parse(JSON.stringify(this.journey)));
} else if (error) {
console.error("An error occurred while fetching train schedules: ", (error));
this.isLoading = true;
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


    // Handle the received message containing journey class options
    // async handleMessage(message) {
    //     if (message && message.journeyClassOptions) {
    //         console.log('Received journeyClassOptions:', message.journeyClassOptions);

    //         this.journeyClassOptions = JSON.parse(message.journeyClassOptions); // Convert JSON string to object
          
    
    //         // Get train details based on the train name
    //         if (this.str_trainName && this.str_Coaches) {
    //             // Log train name and coaches
    //             console.log('Train name:', this.str_trainName);
    //             console.log('Coaches:', this.str_Coaches);
    
    //             // Check if any selected journey class option is not available in the available coaches
    //             if (this.journeyClassOptions.some(option => !this.str_Coaches.includes(option.label))) {
    //                 this.isVisible = false;
    //             } else {
    //                 this.isVisible = true;
    //             }
    //         } else {
    //             console.log('Train details are not yet available.');
    //         }
        
    //     }
    // }

    

    // Unsubscribe from the message channel when the component is disconnected
    disconnectedCallback() {
        unsubscribe(this.subscription);
    }





handleBlockClick(event) {
    console.log("handleBlockClick executed");
if (event.target.classList.contains('date-block')) {
    
    event.target.classList.toggle('blue-background');
}
}
openNewRecord() {
    // Check if required data is available
    if (this.str_trainName && this.strFromStation && this.strToStation && this.selectedDate) {
        // Create a formatted message
        this.formattedMessage =  `You searched trains for Date ${this.selectedDate}  from ${this.strFromStation} to ${this.strToStation} and the train is ${this.str_trainName},
                                   Also the coach is ${this.selectedCoach} Do you want to continue with it?`;
        this.showModal = true;
        this.showModalBackdrop = true;
    } else {
        console.error('Not all required values are available.');
    }
}

closeModal() {
    // Set showModal to false to hide the modal
    this.showModal = false;
    this.showModalBackdrop = false;
}
async handleYesClick() {

    const bookingDetails = {
       
        coach: this.selectedCoach, // Pass the selected coach
        distance: this.distance,    // Pass the distance
        sch_id:this.trainScheduleId // Pass the ScheduleId
    };
    
    
    console.log('Booking Details:', bookingDetails);

    console.log('journeyDate',this.selectedDate);


    await getTrainSchedules({fromStation: this.strFromStation, toStation: this.strToStation, journeyDate: this.selectedDate})
    .then(result => {

        console.log('result: ',result)
        if (result && result.length > 0) {
            console.log('result',result)
        
            bookingDetails.distance = result[0].RMS_Distance__c;
        }   
    })
    .catch(error => {
        console.error('Error fetching train schedules:', error);
    });

    const res = await BookingModal.open({
        size: 'Medium',
        heading: 'Navigate to Record Page',
        description: 'Navigate to a record page by clicking the row button',
        options: bookingDetails  
    })
    this.closeModal()
    if(res) {
        console.log("Clicked ok")
    }


    // Implement your logic here for handling "Yes" click
    console.log('User clicked "Yes". Implement your logic here.');
   

}

handleNoClick() {
    // Implement your logic here for handling "No" click
    console.log('User clicked "No". Implement your logic here.');

    // Show a cancellation toast message
    const event = new ShowToastEvent({
        title: 'Cancelled',
        message: 'Booking process cancelled.',
        variant: 'error',
    });
    this.dispatchEvent(event);

    // Close the modal
    this.closeModal();
}
// async handleConfirmClick() {
//     const result = await LightningConfirm.open({
//         message: `You searched trains for Date ${this.selectedDate}  from ${this.strFromStation} to ${this.strToStation} and the train is ${this.str_trainName},also the coach is ${this.coachValue} Do you want to continue with it?`,
//         variant: 'header',
//         label: 'Confirmation',
//         theme: 'info'
//     });


//     if(result) {
//         // Open new modal upon confirmation
//         this.showBookingModal = true;
//     } else {
//         // Handle cancellation
//         const event = new ShowToastEvent({
//             title: 'Cancelled',
//             message: 'Booking process cancelled.',
//             variant: 'error',
//             });
//             this.dispatchEvent(event);
//     }


//     if(result) {
//         // Show a success toast message
//         const event = new ShowToastEvent({
//             title: 'Success!',
//             message: 'Thank you for booking.',
//             variant: 'success',
//         });
//         this.dispatchEvent(event);
//     } else {
//         const event = new ShowToastEvent({
//         title: 'Cancelled',
//         message: 'Booking process cancelled.',
//         variant: 'error',
//         });
//         this.dispatchEvent(event);
//     }
// }

showBookingModal = false;
selectedGender = '';
genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' }
];

// New methods for the booking modal
handleCancel() {
    this.showBookingModal = false;
}

handleBook() {
    // Handle the booking process here
}




}