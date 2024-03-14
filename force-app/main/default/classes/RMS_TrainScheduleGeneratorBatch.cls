/*
* @ Name            :   RMS_TrainScheduleGenerator
* @ Purpose         :   for automation of train schedule.
* @ Author          :   Anshika Augustine 
* @ Usage           :   1)For scheduling the train schedule for each train to be generated based on train frequency
*                         and using existing schedules as data
*******************************************************************************************************************

*   Date            |  Developer Name                   |  Version      |  Changes
* ======================================================================================================
*   14-02-2024      |  anshika.augustine@absyz.com      |  1.0          |  Initial Version
*   19-02-2024      |  anshika.augustine@absyz.com      |  1.1          |  Optimized it more using custom labels 
*   23-02-2024      |  pranav.nikam@absyz.com           |  1.2          |  updated code like when train schedule created along with coaches also create.
*/  


global class RMS_TrainScheduleGeneratorBatch implements Database.Batchable<SObject>, Schedulable {
    
    // Execute method for Schedulable interface
    global void execute(SchedulableContext sc) {
        Database.executeBatch(this);
    }    
    // Start method for Batchable interface
    global Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator([
            SELECT Id, 
            RMS_Train__c,RMS_From__c, RMS_From__r.Name, RMS_To__c,RMS_To__r.Name, RMS_ArrivalTimeFrom__c,
            RMS_DepartureTimeFrom__c, RMS_ArrivalTimeTo__c, RMS_DepartureTimeTo__c,      
            RMS_BoardingPlatform1__c, RMS_BoardingPlatform2__c,
            RMS_RouteNumber__c, RMS_Train__r.RMS_Weekday__c, RMS_Distance__c, RMS_Date__c,
            RMS_HaltTime__c
            FROM RMS_TrainSchedule__c WHERE RMS_Date__c = null
        ]);
    }
    
    // Execute method for Batchable interface
    global void execute(Database.BatchableContext bc, List<RMS_TrainSchedule__c> List_trainSchedule) {
        System.debug('List_trainSchedule'+List_trainSchedule);
        try{
            // Get the current date
            Date currentDate = Date.today();
            
            Integer intCustomLimit = Integer.valueOf(Label.CLRMS00004);
            // Calculate the end date (from now)
            Date endDate = currentDate.addDays(intCustomLimit);
            
            List<RMS_TrainSchedule__c> List_newSchedules = new List<RMS_TrainSchedule__c>();
            List<RMS_Coach__c> List_newCoaches = new List<RMS_Coach__c>();
            List<Id> List_scheduleIdsToDelete = new List<Id>();
            
            List<String> coachesList = new List<String>{'General(GEN)', 'Sleeper(SL)', 'AC Executive Class(EC)', 'AC Chair Car(CC)', 'AC 3 Tire(3A)', 'AC First Class(1A)','AC 2 Tire(2A)'};
                
            // Iterate over each existing schedule to create new schedules and coaches
            for (RMS_TrainSchedule__c existingSchedule : List_trainSchedule) {
                String[] frequencyDays = existingSchedule.RMS_Train__r.RMS_Weekday__c.split('\\|');
                Date nextOccurrence = currentDate;
                
                while(nextOccurrence <= endDate) {
                    Datetime currentDateTime = Datetime.newInstance(nextOccurrence.year(), nextOccurrence.month(), nextOccurrence.day());
                    String currentDayOfWeek = currentDateTime.format('EEEE');
                    
                    if(frequencyDays.contains(currentDayOfWeek)) {
                        // Create new train schedule
                        RMS_TrainSchedule__c newSchedule = new RMS_TrainSchedule__c(
                            RMS_Train__c = existingSchedule.RMS_Train__c,
                            RMS_From__c = existingSchedule.RMS_From__c,
                            RMS_ArrivalTimeFrom__c = existingSchedule.RMS_ArrivalTimeFrom__c,
                            RMS_DepartureTimeFrom__c = existingSchedule.RMS_DepartureTimeFrom__c,
                            RMS_To__c = existingSchedule.RMS_To__c,
                            RMS_ArrivalTimeTo__c = existingSchedule.RMS_ArrivalTimeTo__c,
                            RMS_DepartureTimeTo__c = existingSchedule.RMS_DepartureTimeTo__c,
                            RMS_BoardingPlatform1__c = existingSchedule.RMS_BoardingPlatform1__c,
                            RMS_BoardingPlatform2__c = existingSchedule.RMS_BoardingPlatform2__c,
                            RMS_RouteNumber__c = existingSchedule.RMS_RouteNumber__c,
                            RMS_Distance__c = existingSchedule.RMS_Distance__c,
                            RMS_HaltTime__c = existingSchedule.RMS_HaltTime__c,
                            RMS_Date__c = nextOccurrence
                        );
                        List_newSchedules.add(newSchedule);
                    }
                    
                    nextOccurrence = nextOccurrence.addDays(1);
                    
                    
                    
                }
                
               // System.debug('Count: '+ count);
                
                // Adding those pre-existing schedules to a list to delete based on the condition
                // less than the current date
                if (existingSchedule.RMS_Date__c != null && existingSchedule.RMS_Date__c < currentDate) {
                    List_scheduleIdsToDelete.add(existingSchedule.Id);
                }
            } 
            
            // Insert new train schedule records
            if (List_newSchedules != null && !List_newSchedules.isEmpty()) {
                insert List_newSchedules;
            }
            
            
            
            for(RMS_TrainSchedule__c newSchedule : List_newSchedules) {
                for(String strVal : coachesList) {
                    RMS_Coach__c coachObj = new RMS_Coach__c();
                    coachObj.Name = strVal;
                    coachObj.Train_Schedule__c = newSchedule.Id;
                    //coachObj.Train_Schedule__c = newSchedule.Name;
                    coachObj.RMS_Capacity__c = 200;
                    coachObj.RMS_ScheduledDate__c = newSchedule.RMS_Date__c;
                    //coachObj.RMS_From__c = newSchedule.RMS_From__r.Name;
                    //coachObj.RMS_To__c = newSchedule.RMS_To__r.Name
                   

                     coachObj.RMS_From__c = newSchedule.RMS_From__c;
                     coachObj.RMS_To__c =   newSchedule.RMS_To__c;
                    //System.debug('RMS_From__c value: ' + newSchedule.RMS_From__c+':Name:'+newSchedule.RMS_From__r.Name);

                    List_newCoaches.add(coachObj);
                }
            }
           // System.debug('List_newCoaches'+List_newCoaches);
            
            // Insert new coach records
            if (List_newCoaches != null && !List_newCoaches.isEmpty()) {
                insert List_newCoaches;
            }
            
            // Delete old train schedules
            List<RMS_TrainSchedule__c> List_schedulesToDelete = [SELECT 
                                                                 Id 
                                                                 FROM 
                                                                 RMS_TrainSchedule__c 
                                                                 WHERE 
                                                                 Id IN :List_scheduleIdsToDelete];
            if (List_schedulesToDelete != null && !List_schedulesToDelete.isEmpty()) {
                delete List_schedulesToDelete;
            }
            
            
            // Delete old coaches
            List<RMS_Coach__c> List_coachesToDelete = [SELECT Id,
                                                       Name 
                                                       FROM 
                                                       RMS_Coach__c 
                                                       WHERE 
                                                       Train_Schedule__c IN :List_schedulesToDelete];
            if (List_coachesToDelete != null && !List_coachesToDelete.isEmpty()) {
                delete List_coachesToDelete;
            }
        }
        
        //Catch the error and store it as records in the Error Log object
        catch (Exception exceptionObj) {
            String errorMessage = exceptionObj.getMessage();
            // Truncate the error message if it exceeds the maximum length
            if (errorMessage.length() > 100) {
                errorMessage = errorMessage.substring(0, 100);
            }
            RMS_ErrorLog__c rmsLog = RMS_ErrorLogHandler.createErrorLog(
                'Train schedule automation error',  // Name
                 errorMessage,  // Error Message
                'Batch execute method for train schedule', // Method Name (Replace with the actual method name)
                'Train Schedule not generating and deleting Issue'
            );
            insert rmsLog;
        }
    }
    
    // Method to check if the current day is a frequency day for the train
    private Boolean blnIsFrequencyDay(Date currentDate, RMS_TrainSchedule__c existingSchedule) {
        String[] frequencyDays = existingSchedule.RMS_Train__r.RMS_Weekday__c.split('\\|');
        Datetime currentDateTime = Datetime.newInstance(currentDate.year(), currentDate.month(), currentDate.day());
        String currentDayOfWeek = currentDateTime.format('EEEE'); // Get the day of the week (e.g., Monday, Tuesday)
        Boolean blnIsFrequencyDay = false;
        for (String frequencyDay : frequencyDays) {
            if (frequencyDay.equalsIgnoreCase(frequencyDay.trim())) {
                blnIsFrequencyDay = true;
                break;
            }	
        }
        return blnIsFrequencyDay;
    }
    
    // Finish method for Batchable interface
    global void finish(Database.BatchableContext bc) {
        System.debug('Batch job completed successfully!');
    }
}