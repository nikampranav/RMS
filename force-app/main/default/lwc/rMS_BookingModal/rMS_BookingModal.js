import { track, api } from 'lwc';
import LightningModal from 'lightning/modal';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
//import decCalculatePricePerKm from '@salesforce/apex/RMS_BookingHandler.decCalculatePricePerKm';
import createBookingRecord from '@salesforce/apex/RMS_BookingHandler.createBookingRecord';
import getTicketPrice from '@salesforce/apex/RMS_BookingHandler.getTicketPrice';
import getMappedRate from '@salesforce/apex/RMS_BookingHandler.getMappedRate';
import getDistancePrice from '@salesforce/apex/RMS_BookingHandler.getDistancePrice';


export default class BookingModal extends LightningModal {
    @track FullName = '';
    @track Gmail= '';
    @track age = 18;
    @track gender = '';
    @track seat = '';
    @track coach = ''; 
    @track distance = ''; 
    @track showModal = true;
    bookingDetails;
    @track ticketPrice = 0.00;
    @track passengers = 0; 
    @track showTicketPrice=false;
    @api options = {}
    @track boolPriceLoading=false;
    @track coachPrice=0;
    @track distancePrice=0;
    @track boolGender = false;
    mappedRate={};
    isLoading = false;
    buttonLabel = 'Book';
    @track coachVal = '';
    showToast(title,message,variant){
        const event=ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        })
        dispatchEvent(event);
    }

    get customStyle() {
        return 'height: 20px; font-size: 12px; font-family: Arial, sans-seriff ; --webkit-inner-spin-button-opacity: 1';
    }
    
    connectedCallback() {
       this.coachVal = this.options.coach;
        
       getDistancePrice({Distance: this.options.distance})
       .then(result=>{
           this.distancePrice = result;
       })
       .catch((error)=>{console.log(JSON.stringify(error))})

        getMappedRate()
        .then((result)=>{
            console.log(result);
            console.log(typeof result)
            this.mappedRate = result
            Object.keys(result).forEach((item) => {
                if(item==this.coachVal){
                    this.coachPrice = parseInt(result[item])
                }
            })
        }).catch((error)=>{console.log('Error Fetching',JSON.stringify(error))})
        console.log("Options: ", this.options);
    }



    get genderOptions() {
        return [
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
            { label:'Other',  value:'other'}
        ];
    }
   
  

    handleGender(){
        this.boolGender = true;
    }
    handleModalClose() {
        this.close('success')
        this.showModal = false;
    }

    handlePreviousClick() {
        // Implement your logic here for handling "No" click
        console.log('User clicked "No". Implement your logic here.');
        this.showToast('Booking Cancelled','','error');
        this.close();
    }
    handlePassengerChange(event) {
        this.passengers = event.target.value;
        this.ticketPrice = (this.distancePrice + this.coachPrice)*this.passengers

    }
    handleNameChange(event){
        this.FullName = event.target.value;
    }
    handleGmailChange(event){
        this.Gmail = event.target.value
    }
    renderedCallback(){
        this.applyAnimation()
    }

    applyAnimation(){
        const modalBody = this.template.querySelector('.modal-wrapper');
        if(modalBody){
            console.log('Applying Animation')
            modalBody.classList.add('animation-fade-in')
        }
    }
    handleBookingClick() {
        this.isLoading = true;
        console.log('Book button clicked');
        
        console.log('Booking Details:', this.options.coach, this.options.distance, this.passengers);
        if (this.options.coach && this.options.distance && this.passengers!=0 && this.boolGender) {
            this.createBooking(); // Calling the createBooking method
        } else {
            this.isLoading = false;
            this.showToast('Error','Please Check all Values','error')
            console.log('One or more parameters are null');
        }
        
    }
    handleAgeChange(event){
        this.age=event.target.value;
        if(this.age<18 || this.age>123){
            this.age=18
            this.showToast('Enter Valid Age','Please Enter a valid Age','warning');
        }
    }
   

    createBooking() {
        createBookingRecord({
            coach: this.options.coach,
            distance: this.options.distance,
            passengers: this.passengers,
            FullName: this.FullName,
            sch_Id: this.options.sch_id
        })
        .then(() => {
           this.isLoading=false;
            this.showToast('Booked Successfully','','success')

            this.close();
        })
        .catch(error => {
            console.error('Error creating booking record:', error);
            this.isLoading = false; 
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error creating booking record',
                    message: error.body.message,
                    variant: 'error',
                })
            );
        });
    }
    

    get coach() {
        return this.bookingDetails && this.bookingDetails.coach ? this.bookingDetails.coach : '';
    }

    get distance() {
        return this.bookingDetails && this.bookingDetails.distance ? this.bookingDetails.distance : '';
    }

    
}