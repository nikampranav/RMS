trigger rms_Booking on RMS_Booking__c (after insert, after update) {
    for (RMS_Booking__c newBooking : Trigger.new) {
        RMS_TrainBookingService.updateSeatAvailability(newBooking.Id);
    }
}