/*
* @ Purpose         :   This class fetches and returns specific details of a Train schedule from Org.                      
* @ Author          :   Pranav nikam
* @ Usage           :   1)fetch and return the Train schedule 
*******************************************************************************************************
*
*   Date            |  Developer Name              |  Version      |  Changes
* ======================================================================================================
*   31-01-2024      |  pranav.nikam@absyz.com      |  1.0          |  Initial Version
*/

/*
public with sharing class RMS_MyJourneyController {
   @AuraEnabled(cacheable=true)
    public static List<RMS_TrainSchedule__c> getTrainSchedules(String fromStation, String toStation, String journeyDate) {
        System.debug('from to journey date');
        System.debug(fromStation+'//'+toStation+'//'+journeyDate);
        Date DjourneyDate = Date.valueOf(journeyDate);
        List<RMS_TrainSchedule__c> sampleList = [select Id FROM 
        RMS_TrainSchedule__c 
        WHERE 
        RMS_From__r.Name = :fromStation 
        AND 
        RMS_To__r.Name = :toStation 
        AND RMS_Date__c = :DjourneyDate and Id in (select Train_Schedule__c from RMS_Coach__c)
        ];

        System.debug('schedId'+sampleList);

        return [
        SELECT Id,
        RMS_Train__r.Name,
        RMS_Train__r.RMS_Weekday__c,
        RMS_From__r.Name, 
        RMS_To__r.Name,
        RMS_ArrivalTimeTo__c,
        RMS_ArrivalTimeFrom__c, 
        RMS_DepartureTimeFrom__c,
        RMS_Date__c
        FROM 
        RMS_TrainSchedule__c 
        WHERE 
        RMS_From__r.Name = :fromStation 
        AND 
        RMS_To__r.Name = :toStation 
        AND RMS_Date__c = :DjourneyDate and Id in (select Train_Schedule__c from RMS_Coach__c)
        ];
    }
}
*/

public with sharing class RMS_MyJourneyController {
    @AuraEnabled(cacheable=true)
    public static List<RMS_TrainSchedule__c> getTrainSchedules(String fromStation, String toStation, String journeyDate) {
        Date DjourneyDate = Date.valueOf(journeyDate);
        
        List<RMS_TrainSchedule__c> trainSchedules = [
            SELECT Id,
                RMS_Train__r.Name,
                RMS_Train__r.RMS_Weekday__c,
                RMS_From__r.Name, 
                RMS_To__r.Name,
                RMS_ArrivalTimeTo__c,
                RMS_ArrivalTimeFrom__c, 
                RMS_DepartureTimeFrom__c,
                RMS_Distance__c,
                RMS_Date__c
                FROM RMS_TrainSchedule__c 
                WHERE RMS_From__r.Name = :fromStation 
                AND RMS_To__r.Name = :toStation 
                AND RMS_Date__c = :DjourneyDate 
                AND RMS_Date__c!= null
               // AND Id IN (SELECT Train_Schedule__c FROM RMS_Coach__c)
                
               
        ];
        SYSTEM.debug('train sechedules => '+trainSchedules);
        return trainSchedules;
    }
}