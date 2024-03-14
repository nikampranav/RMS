/*
* @ Purpose         :   This class update the coach capacity                       
* @ Author          :   Pranav nikam
* @ Usage           :   1)fetch and return the Coach Capacity
*******************************************************************************************************
*
*   Date            |  Developer Name              |  Version      |  Changes
* ======================================================================================================
*   06-02-2024      |  pranav.nikam@absyz.com      |  1.0          |  Initial Version
*/

public class RMS_UpdateCoachCapacityHandler {
    public static void updateSeats(Set<Id> Set_coachIds) {
        System.debug('updateSeats:' + Set_coachIds);
        List<RMS_Seat_Availability_c__c> List_seatsToUpdate = new List<RMS_Seat_Availability_c__c>();

        List<RMS_Seat_Availability_c__c> List_seats = [SELECT Id, 
                                                       RMS_Coaches__c, 
                                                       RMS_Date__c, 
                                                       RMS_Total_seats__c, 
                                                       RMS_Vacant_Seats__c 
                                                       FROM 
                                                       RMS_Seat_Availability_c__c 
                                                       WHERE RMS_Coaches__c 
                                                       IN :Set_coachIds];

        List<RMS_Booking__c> List_bookings = [SELECT 
                                              RMS_No_of_Passenger__c, 
                                              Coach__c, 
                                              Date__c 
                                              FROM 
                                              RMS_Booking__c 
                                              WHERE Coach__c 
                                              IN :Set_coachIds];

        for (RMS_Seat_Availability_c__c seat : List_seats) {
            Decimal reservedSeats = 0;
            for (RMS_Booking__c booking : List_bookings) {
                if (booking.Coach__c == seat.RMS_Coaches__c && booking.Date__c == seat.RMS_Date__c) {
                    reservedSeats += booking.RMS_No_of_Passenger__c;
                }
            }

            System.debug(reservedSeats.intValue());
            if (seat != null && seat.RMS_Total_seats__c != null) {
                seat.RMS_Vacant_Seats__c = seat.RMS_Total_seats__c - reservedSeats.intValue();
                System.debug('Updated Seat: ' + seat);
                List_seatsToUpdate.add(seat);
            } else {
                System.debug('Seat or Total Seats is null');
            }
        }

        System.debug('Seats to update: ' + List_seatsToUpdate);
        update List_seatsToUpdate;
    }
}