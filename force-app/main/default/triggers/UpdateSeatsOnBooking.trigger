/*
* @ Name            :   RMS_BookingTrigger
* @ Purpose         :   For automatically update coach cpacity
* @ Author          :   Pranav Nikam, Navneeth Hari
*
*************************************************** ****************************************************
*   Date            |  Developer Name              |  Version      |  Changes
* ======================================================================================================
*   18-01-2024      |  pranav.nikam@absyz.com      |  1.0          |  Initial Version
*
*******************************************************************************************************
*    Label                             | Purpose            
*  | :-------------------------------- | :-----------------                                                    |
*  | RMS_UpdateSeatOnBooking               | It’s designed to  update the available data    |     
*/

trigger UpdateSeatsOnBooking on RMS_Booking__c (after insert, after update) {
    Set<Id> coachIds = new Set<Id>();
    
    for (RMS_Booking__c booking : Trigger.new) {
        coachIds.add(booking.Coach__c);
    }

    RMS_UpdateCoachCapacityHandler.updateSeats(coachIds);
}