/*
* @ Name            :   RMS_Bookinghandler
* @ Purpose         :   for Fair generation logic.
* @ Author          :   Pranav Nikam, Navneeth Hari, Anshika Augustine 
* @ Usage           :   1)For generating the total Fair according to the passenger choice.
*******************************************************************************************************

*   Date            |  Developer Name              |  Version      |  Changes
* ======================================================================================================
*   18-01-2024      |  pranav.nikam@absyz.com      |  1.0          |  Initial Version
*   19-01-2024      |  navaneeth.hari@absyz.com    |  1.1          |  Updated the class RMS_BookingHandler, its methods
*   22-01-2024      |  anshika.augustine@absyz.com |  1.2          |  Optimized the code by reducing the soqlsfor loops
*/  

public class RMS_BookingHandler {

   @AuraEnabled
public static Id createBookingRecord(String coach, Integer distance, Integer passengers, String FullName, String sch_Id) {
    // Perform record insertion here using the provided parameters
    String ret_Id;

    System.debug('Creating booking record with Coach: ' + coach + ', Distance: ' + distance + ', Passengers: ' + passengers);
    system.debug(FullName+' is the Full_Name');
    RMS_Booking__c newBooking = new RMS_Booking__c();
    newBooking.Full_Name__c = FullName;
    newBooking.RMS_COACH__c = coach;
    newBooking.RMS_DISTANCE__c = distance;
    newBooking.RMS_No_of_Passenger__c = passengers;
    newBooking.Train_Schedule__c = sch_Id;
    try {
        insert newBooking;
        System.debug('Booking record created successfully'+newBooking);
        return newBooking.Id;
    } catch (Exception e) {
        System.debug('Error while creating booking record: ' + e.getMessage());
        return null;
    }
}



    public static boolean blnisExecuting = False;
    
    
    /* 
    * @ author       :  Nikam Pranav
    * @ description  :  The decCalculatePricePerKm method is used to calculate the price per kilometer based on 
    *                   the distance of the journey.    
    */

    @AuraEnabled(cacheable=true)
    public static Integer decCalculatePricePerKm(list<RMS_Booking__c> list_NewBooking,Boolean blnisUpdateFlag) {
        Integer intTotalPrice=0;

        system.debug('list_NewBooking' +list_NewBooking);
        if(!blnisExecuting){
            blnisExecuting=True;
            
            list<RMS_Booking__c> List_BookingUpdate = new list<RMS_Booking__c>();
            
            list<RMS_DistancePricing__mdt> list_pricingList = [
                SELECT 
                MasterLabel,
                Map_Coach_Price__c, 
                Map_Pricing__c,
                Map_MaxDistance__c,
                Map_MinDistance__c 
                FROM 
                RMS_DistancePricing__mdt ];
            system.debug('list_pricingList'+list_pricingList);
            map<String,Integer> map_CoachPrice = new map<String,Integer>();
            for (RMS_DistancePricing__mdt pricing : list_pricingList) {
                map_CoachPrice.put(pricing.MasterLabel, (Integer) pricing.Map_Coach_Price__c);
            }
            map<Id,integer> map_BookingPricing = new map<Id,integer>();
                
            for(RMS_Booking__c bookingObj: list_NewBooking){
                system.debug('bookingObj: ' + bookingObj);
                for(integer i =0; i < list_pricingList.size() ; i++){
                    if (list_pricingList[i].Map_MaxDistance__c > bookingObj.RMS_DISTANCE__C && list_pricingList[i].Map_MinDistance__c < bookingObj.RMS_DISTANCE__C){
                        map_BookingPricing.put(bookingObj.Id,list_pricingList[i].Map_Pricing__c.intvalue());
                        system.debug('Booking ID: ' + bookingObj.Id + ', Pricing: ' + list_pricingList[i].Map_Pricing__c.intvalue()); // Debug statement
                        break;
                    }
                }
                Integer intDistancePrice = map_BookingPricing.get(bookingObj.Id);
                String strCoach = bookingObj.RMS_COACH__c;
                Integer intCoachPrice = map_CoachPrice.get(strCoach);
                if(intCoachPrice != null && intDistancePrice != null && bookingObj.RMS_No_of_Passenger__c != null) {
                    intTotalPrice=(intCoachPrice+intDistancePrice)*bookingObj.RMS_No_of_Passenger__c.intValue();
                } else {
                    // Handle the case where one of the values is null
                    system.debug('intCoachPrice: ' + intCoachPrice + ', intDistancePrice: ' + intDistancePrice + ', No_of_Passenger: ' + bookingObj.RMS_No_of_Passenger__c);
                }
                
                system.debug('Total Price is'+intTotalPrice);
                if(blnisUpdateFlag){
                    RMS_Booking__c bookingUpdateObj = new RMS_Booking__c();
                    bookingUpdateObj.RMS_Ticket_Price__c = intTotalPrice;
                    bookingUpdateObj.Id = bookingObj.Id;
                    List_BookingUpdate.add(bookingUpdateObj);
                }
                else{
                    bookingObj.RMS_Ticket_Price__c = intTotalPrice;
                }
                
            }
            if(!List_BookingUpdate.isEmpty())
                update List_BookingUpdate;
            
        }
        blnisExecuting=False;

        return intTotalPrice;
    }
}