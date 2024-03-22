/*
* @ Purpose         :   This class fetches and returns specific details of Train                      
* @ Author          :   Navaneeth S Hari
* @ Usage           :   1)Fetch and return train Schedule 
*******************************************************************************************************
*
*   Date            |  Developer Name              |  Version      |  Changes
* ======================================================================================================
*   07-02-2024      |  navaneeth.hari@absyz.com    |  1.0          |  Initial Version
*/




public with sharing class RMS_TrainScheduleHandler {

    /**
     * @ author       :  Navaneeth S Hari
     * @ description  :  This method is used to return the Train Details
    **/

    @AuraEnabled(cacheable=true)
    public static list<RMS_Train__c> returnTrainDetails(string str_recordId){
        try {
            list<RMS_Train__c> list_TrainObj= [SELECT Name,
            RMS_TrainNo__c,
            RMS_Starting__c,
            RMS_Destination__c,
            RMS_Weekday__c
            FROM RMS_Train__c
            WHERE Id=:str_recordId
            ];
            System.debug('Train Deets: '+list_TrainObj);
            return list_TrainObj;
        } catch (Exception e) {
            system.debug('Error: '+e.getMessage());
            throw new AuraHandledException(e.getMessage());
        }
    }

/**
     * @ author       :  Navaneeth S Hari
     * @ description  :  This method is used to return the Field Names and Labels
    **/

    @AuraEnabled(cacheable=true)
    public static map<String,String> getFieldLabels(){
        try {
                map<String,String> map_FieldLabel = new map<String,String>();
                list<String> list_FieldNames = new list<String>();
                list<String> list_Labels = new list<String>();
                String Str_Value;
                map<String, RMS_TrainScheduleTable__mdt> map_scheduleLabels = RMS_TrainScheduleTable__mdt.getAll();
                
                for(string obj:map_scheduleLabels.keySet())
                {
                    Str_Value = map_scheduleLabels.get(obj).RMS_TableFieldName__c;
                    list_FieldNames = Str_Value.split(',');
                    Str_Value = map_scheduleLabels.get(obj).RMS_TableLabel__c;
                    list_Labels = Str_Value.Split(',');
                    
                }

                if(list_FieldNames.size() == list_Labels.size())
                {
                    for(integer i=0; i<list_FieldNames.size();i++)
                    {
                        map_FieldLabel.put(list_Labels[i],list_FieldNames[i]);
                    }
                }
                if(!map_FieldLabel.isEmpty())
                    return map_FieldLabel;
                else
                    return null;
        } 
        catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }


    /**
     * @ author       :  Navaneeth S Hari
     * @ description  :  This method is used to return the train Schedule Details
    **/

   @AuraEnabled(cacheable=true)
   public static list<RMS_TrainSchedule__c> returnSchedule(string str_recordId,string str_fromStation,string str_toStation,string str_date){
    try {
            integer int_day,int_month;
            boolean bool_flag=false;
            String str_updated=str_fromStation;
            Date date_journeyDate = Date.valueOf(str_date);
            List<RMS_TrainSchedule__c> newList = new List<RMS_TrainSchedule__c>();
            system.debug(date_journeyDate);

            List<RMS_TrainSchedule__c> tempVar = [SELECT RMS_BaseSchedule__c,RMS_BaseSchedule__r.RMS_From__c
            FROM RMS_TrainSchedule__c
            WHERE RMS_Date__c=:date_journeyDate
            AND RMS_Train__c =: str_recordId
            AND RMS_BaseSchedule__c!=NULL 
            LIMIT 1];

            system.debug(tempVar);
            String str_baseId = tempVar[0].RMS_BaseSchedule__c ;
            String str_baseFromId = tempVar[0].RMS_BaseSchedule__r.RMS_From__c;
            system.debug(str_baseFromId+str_baseId);

            RMS_TrainSchedule__c firstEntry = [SELECT
            RMS_ArrivalTimeTo__c,
            RMS_DepartureTimeTo__c,
            RMS_HaltTime__c,
            RMS_DepartureTime__c,
            RMS_RouteNumber__c,
            RMS_To__r.RMS_StationCode__c,
            RMS_Distance__c,
            RMS_From__r.Name,
            RMS_To__r.Name,
            RMS_Train__r.Name,
            RMS_Train__r.RMS_TrainNo__c,
            RMS_Train__r.RMS_Weekday__c
            FROM RMS_TrainSchedule__c
            WHERE Id=:str_baseId ];

            newList.add(firstEntry);

            List<RMS_TrainSchedule__c> list_TrainSchedules= [SELECT
                RMS_ArrivalTimeTo__c,
                RMS_DepartureTimeTo__c,
                RMS_HaltTime__c,
                RMS_DepartureTime__c,
                RMS_RouteNumber__c,
                RMS_To__r.RMS_StationCode__c,
                RMS_Distance__c,
                RMS_From__r.Name,
                RMS_To__r.Name,
                RMS_Train__r.Name,
                RMS_Train__r.RMS_TrainNo__c,
                RMS_Train__r.RMS_Weekday__c
                FROM RMS_TrainSchedule__c
                WHERE RMS_BaseSchedule__c = :str_baseId
                AND RMS_From__c=:str_baseFromId
                ORDER BY RMS_Distance__c ASC 
            ];
            newList.addAll(list_TrainSchedules);
            
            return newList;
            
    } catch (Exception e) {
        throw new AuraHandledException(e.getMessage());
    }
   }
}