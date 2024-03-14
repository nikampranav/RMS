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
    
    public static boolean blnisExecuting = False;
    
    
    /* 
    * @ author       :  Nikam Pranav
    * @ description  :  The decCalculatePricePerKm method is used to calculate the price per kilometer based on 
    *                   the distance of the journey.
    */
    
    public static void decCalculatePricePerKm(list<RMS_BOOKING__c> list_NewBooking,Boolean blnisUpdateFlag) {
        if(!blnisExecuting){
            blnisExecuting=True;
            
            /*
            * RMS_DistancePricing__mdt : SOQLs
            */
                        
            
            list<RMS_BOOKING__C> List_BookingUpdate = new list<RMS_BOOKING__C>();
            
            list<RMS_DistancePricing__mdt> list_pricingList = [
                SELECT 
                MasterLabel,
                Map_Coach_Price__c, 
                Map_Pricing__c,
                Map_MaxDistance__c,
                Map_MinDistance__c 
                FROM 
                RMS_DistancePricing__mdt ];
            
            map<String,Integer> map_CoachPrice = new map<String,Integer>();
            for (RMS_DistancePricing__mdt pricing : list_pricingList) {
                map_CoachPrice.put(pricing.MasterLabel, pricing.Map_Coach_Price__c.intValue());
            }
            map<Id,integer> map_BookingPricing = new map<Id,integer>();
                
            for(RMS_Booking__c bookingObj: list_NewBooking){
                 for(integer i =0; i < list_pricingList.size() ; i++){
                    if (list_pricingList[i].Map_MaxDistance__c > bookingObj.RMS_DISTANCE__C && list_pricingList[i].Map_MinDistance__c < bookingObj.RMS_DISTANCE__C){
                        map_BookingPricing.put(bookingObj.Id,list_pricingList[i].Map_Pricing__c.intvalue());
                        break;
                    }
                }
                Integer intDistancePrice = map_BookingPricing.get(bookingObj.Id);
                String strCoach = bookingObj.RMS_COACH__c;
                Integer intCoachPrice = map_CoachPrice.get(strCoach);
                Integer intTotalPrice=0;
                intTotalPrice=(intTotalPrice+intCoachPrice+intDistancePrice)*bookingObj.RMS_No_of_Passenger__c.intValue();
                
                system.debug('Total Price is'+intTotalPrice);
                if(blnisUpdateFlag){
                    RMS_BOOKING__C bookingUpdateObj = new RMS_BOOKING__C();
                    bookingUpdateObj.RMS_Ticket_Price__c = intTotalPrice;
                    bookingUpdateObj.Id	=	bookingObj.Id;
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
    }
}