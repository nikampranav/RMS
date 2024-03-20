/*
* @ Name            :   RMS_BookingTrigger
* @ Purpose         :   For automatically calculate the total ticket price
* @ Author          :   Pranav Nikam, Navneeth Hari
* @ Usage           :   1)It’s designed to automatically calculate the total ticket price 
                          whenever a new booking record is inserted or an existing one is updated.
*************************************************** ****************************************************
*   Date            |  Developer Name              |  Version      |  Changes
* ======================================================================================================
*   18-01-2024      |  pranav.nikam@absyz.com      |  1.0          |  Initial Version
*   19-01-2025      |  navaneeth.hari@absyz.com    |  1.1          |  Updated trigger and methods
*
*******************************************************************************************************
*    Label                             | Purpose            
*  | :-------------------------------- | :-----------------                                                    |
*  | RMS_BookingTrigger                | It’s designed to automatically calculate the total ticket price       |     
*/

trigger RMS_BookingTrigger on RMS_Booking__c (before insert, after update) {
    RMS_SwitchTrigger ST = RMS_SwitchTrigger.getValue('Activate');
    if(ST.BlnActive == True){
        if(trigger.isUpdate)
            RMS_BookingHandler.decCalculatePricePerKm(trigger.New,True);
        if(trigger.isInsert)
            RMS_BookingHandler.decCalculatePricePerKm(trigger.New,False);
    }
}