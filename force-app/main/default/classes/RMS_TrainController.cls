/*
* @ Purpose         :   This class fetches and returns specific details of a train from Org based on the trains name.                       
* @ Author          :   Pranav nikam
* @ Usage           :   1)fetch and return the Train Name for a given list of coaches
*******************************************************************************************************
*
*   Date            |  Developer Name              |  Version      |  Changes
* ======================================================================================================
*   29-01-2024      |  pranav.nikam@absyz.com      |  1.0          |  Initial Version
*/

public with sharing class RMS_TrainController {
    @AuraEnabled(cacheable=true)
    public static RMS_Train__c List_getTrainDetails(String trainName) {
    SYSTEM.debug('trainName'+trainName);
        return [SELECT 
        Name,
        RMS_Starting__c,
        RMS_Destination__c, 
        RMS_Coach__c
        FROM
        RMS_Train__c 
        WHERE 
        Name = :trainName 
        LIMIT 1];
    }
}