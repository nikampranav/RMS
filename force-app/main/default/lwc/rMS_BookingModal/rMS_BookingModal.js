import { track, api } from 'lwc';
import LightningModal from 'lightning/modal';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import decCalculatePricePerKm from '@salesforce/apex/RMS_BookingHandler.decCalculatePricePerKm';
import createBookingRecord from '@salesforce/apex/RMS_BookingHandler.createBookingRecord';



export default class BookingModal extends LightningModal {
    @track FullName = '';
    @track age = '';
    @track gender = '';
    @track seat = '';
    @track coach = ''; 
    @track distance = ''; 
    @track showModal = false;
    bookingDetails;
    @track ticketPrice = '';
    @track passengers = ''; 
    @track showTicketPrice=false;
    @api options = {}

    connectedCallback() {
        console.log("Options: ", this.options);
    }



    get genderOptions() {
        return [
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
        ];
    }
   
  

    handleBookingClick() {
        this.showModal = true;
    }

    handleModalClose() {
        this.showModal = false;
    }

    handlePreviousClick() {
        // Implement your logic here for handling "No" click
        console.log('User clicked "No". Implement your logic here.');
    
        this.close();
    }
    handlePassengerChange(event) {
        this.passengers = event.target.value;
    }
    handleNameChange(event){
        this.FullName = event.target.value;
    }
    handleYesClick() {
        console.log('Book button clicked');
        
        console.log('Booking Details:', this.options.coach, this.options.distance, this.passengers);
        if (this.options.coach && this.options.distance && this.passengers) {
            this.createBooking(); // Calling the createBooking method
        } else {
            console.log('One or more parameters are null');
        }
    }
    
    // Corrected createBooking method definition
    createBooking() {
        createBookingRecord({
            coach: this.options.coach,
            distance: this.options.distance,
            passengers: this.passengers,
            FullName: this.FullName,
            sch_Id: this.options.sch_id
        })
            .then((result) => {
                this.bookingId = result
                this.showTicketPrice=true;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Booking record created',
                        variant: 'success',
                    })
                );
            })
            .then(() =>{
                getTicketPrice({recId:this.bookingId})
                .then((res)=>{
                    this.ticketPrice = res
                })
            })
            .catch(error => {
                console.error('Error creating booking record:', error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating booking record',
                        message: error.body.message,
                        variant: 'error',
                    })
                );
            });
    
    
        
    
        // Create an object with the booking details
//         const bookingDetails = {
//             coach: this.options.coach,  
//             distance: this.options.distance,
//             passengers: this.passengers 
//         };

//         console.log('Booking Details:', bookingDetails);

//         const { coach, distance, passengers } = bookingDetails;

//         decCalculatePricePerKm({ coach: bookingDetails.coach, distance: bookingDetails.distance, passengers:bookingDetails.passengers, blnisUpdateFlag: false })
//           .then(result => {
//               // handle successful response
//              console.log(result);
//               if (result) {
//                  this.ticketPrice = result;
//          } else {
//             console.log('No result returned from decCalculatePricePerKm');
//      }
// })
// .catch(error => {
//     // handle error
//     console.log('Error calling decCalculatePricePerKm:', error);
// });

    
        

    
    }

    get coach() {
        return this.bookingDetails && this.bookingDetails.coach ? this.bookingDetails.coach : '';
    }

    get distance() {
        return this.bookingDetails && this.bookingDetails.distance ? this.bookingDetails.distance : '';
    }


    

    
}





