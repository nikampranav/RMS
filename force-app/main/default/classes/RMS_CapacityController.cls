/*
* @ Purpose         :   The class RMS_CapacityController is designed to fetch 
*                        and return the capacity mapping for a given list of coaches.
* @ Author          :   Pranav nikam
* @ Usage           :   1)fetch and return the capacity mapping for a given list of coaches
*******************************************************************************************************
*
*   Date            |  Developer Name              |  Version      |  Changes
* ======================================================================================================
*   29-01-2024      |  pranav.nikam@absyz.com      |  1.0          |  Initial Version
*/




public with sharing class RMS_CapacityController {
    public class CoachWrapper {
        @AuraEnabled
        public String name;
        @AuraEnabled
        public List<RMS_Coach__c> coaches;

        public CoachWrapper(String name, List<RMS_Coach__c> coaches) {
            this.name = name;
            this.coaches = coaches;
        }
    }


    @AuraEnabled(cacheable=true)
    public static List<RMS_Coach__c> getAvailableDates(String scheduledDate, String trainScheduleId, String fromStation, String toStation, String coachName) {
        system.debug('toStation:' + toStation);
        system.debug('scheduledDate:' + scheduledDate);
        system.debug('trainScheduleId:' + trainScheduleId);
        system.debug('fromStation:' + fromStation);
        system.debug('CoachName: ' + coachName);

        RMS_TrainSchedule__c trainObj = [SELECT RMS_Train__r.Name FROM RMS_TrainSchedule__c WHERE Id = :trainScheduleId LIMIT 1];

        System.debug('Train: ' + trainObj);

        return [
            SELECT Id, Name, RMS_Capacity__c, Train_Schedule__r.Name, RMS_ScheduledDate__c FROM RMS_Coach__c 
            WHERE Train_Schedule__r.RMS_Train__r.Name = :trainObj.RMS_Train__r.Name AND RMS_ScheduledDate__c >= :Date.valueOf(scheduledDate)
                AND RMS_From__r.Name = :fromStation 
                AND RMS_To__r.Name = :toStation 
                AND Name = :coachName
            ORDER BY RMS_ScheduledDate__c ASC
            LIMIT 7
        ];
    }

   @AuraEnabled(cacheable=true)
    public static List<CoachWrapper> getAvailableSeats(String scheduledDate, String trainScheduleId, String fromStation, String toStation, String coachName) {
    system.debug('toStation:' + toStation);
    system.debug('scheduledDate:' + scheduledDate);
    system.debug('trainScheduleId:' + trainScheduleId);
    system.debug('fromStation:' + fromStation);
    system.debug('CoachName: ' + coachName);

        Date dateVal = Date.valueOf(scheduledDate);
        List<Date> nextSixDates = new List<Date>();
        for (Integer i = 0; i < 6; i++) {
        nextSixDates.add(dateVal.addDays(i));
        }

        Map<String, List<RMS_Coach__c>> coachCapacityMap = new Map<String, List<RMS_Coach__c>>();
        List<RMS_TrainSchedule__c> trainScheduleCoaches = [
            SELECT Id, (SELECT Id, Name, RMS_Capacity__c FROM Coaches__r) FROM RMS_TrainSchedule__c 
            WHERE Id = :trainScheduleId AND RMS_Date__c = :dateVal AND RMS_From__r.Name = :fromStation AND RMS_To__r.Name = :toStation
        ];

        for (RMS_TrainSchedule__c sched : trainScheduleCoaches) {
            for (RMS_Coach__c coachObj : sched.Coaches__r) {
                if (!coachCapacityMap.containsKey(coachObj.Name)) {
                    coachCapacityMap.put(coachObj.Name, new List<RMS_Coach__c>());
                }
            }
        }


        List<RMS_Coach__c> availableSeats = [
            SELECT Id, Name, RMS_Capacity__c, Train_Schedule__r.Name, RMS_ScheduledDate__c FROM RMS_Coach__c 
            WHERE Train_Schedule__r.RMS_Train__r.Name = 'VANDE BHARAT SPL' AND RMS_ScheduledDate__c = :dateVal 
                AND Train_Schedule__c = :trainScheduleId 
                AND RMS_From__r.Name = :fromStation 
                AND RMS_To__r.Name = :toStation 
                AND Name = :coachName
            ORDER BY RMS_ScheduledDate__c ASC
            LIMIT 7
        ];
       

         System.debug('Available Seats: ' + availableSeats);

        for (RMS_Coach__c ob : availableSeats) {
            coachCapacityMap.get(ob.Name).add(ob);
        }

        List<CoachWrapper> coachWrappers = new List<CoachWrapper>();
        for (String key : coachCapacityMap.keySet()) {
            coachWrappers.add(new CoachWrapper(key, coachCapacityMap.get(key)));
        }
        return coachWrappers;
    }
}