public class RMS_TrainBookingService {
    public static void updateSeatAvailability(Id bookingId) {
        System.debug('Booking Id: ' + bookingId);
        boolean Empty=True;
        // Get the booking details
        RMS_Booking__c booking = [SELECT 
                                  Id, 
                                  RMS_No_of_Passenger__c, 
                                  Train_Schedule__c, 
                                  RMS_Coach__c,
                                  Date__c
                                  FROM 
                                  RMS_Booking__c 
                                  WHERE 
                                  Id = :bookingId
                                 ];
        System.debug('Booking Details: ' + booking);
        
        // Get the related seat availability
        List<RMS_Seat_Availability_c__c> seatAvailabilityList = [SELECT 
                                                         Id, 
                                                         Train_Schedule__c, 
                                                         RMS_Vacant_Seats__c,
                                                         RMS_Date__c
                                                         FROM 
                                                         RMS_Seat_Availability_c__c 
                                                         WHERE 
                                                         Train_Schedule__c = :booking.Train_Schedule__c 
                                                         AND
                                                         RMS_Date__c = :booking.Date__c
                                                         LIMIT 1
                                                        ];
        System.debug('Seat Availability List: ' + seatAvailabilityList);

        RMS_Seat_Availability_c__c seatAvailability;
	
        if (!seatAvailabilityList.isEmpty()) {
            seatAvailability = seatAvailabilityList[0];
            empty=False;
        }
        System.debug('Seat Availability: ' + seatAvailability);
        
        // If no seat availability record exists for the given date, create a new one
        if (empty) {
            seatAvailability = new RMS_Seat_Availability_c__c(
                Train_Schedule__c = booking.Train_Schedule__c,
                RMS_Date__c = booking.Date__c,
                RMS_Vacant_Seats__c = 0 // Initialize with 0 vacant seats
            );
        }
        
        // Check if there are enough vacant seats
        if (seatAvailability.RMS_Vacant_Seats__c >= booking.RMS_No_of_Passenger__c) {
            seatAvailability.RMS_Vacant_Seats__c -= booking.RMS_No_of_Passenger__c;
            System.debug('Updated Vacant Seats: ' + seatAvailability.RMS_Vacant_Seats__c);
            
            // Update or insert the seat availability record
            upsert seatAvailability;
            
            System.debug('Booking successful for Train Schedule: ' + seatAvailability.Train_Schedule__c);
        } else {
            System.debug('Not enough vacant seats available for Train Schedule: ' + seatAvailability.Train_Schedule__c);
        }
    }
}