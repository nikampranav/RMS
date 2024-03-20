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
            RMS_TrainSchedule__c tempVar = [SELECT RMS_BaseSchedule__r.RMS_From__r.Name
            FROM RMS_TrainSchedule__c
            WHERE RMS_Date__c=:date_journeyDate 
            AND RMS_Train__c =: str_recordId
            AND RMS_From__r.Name=:str_updated
            LIMIT 1];

            system.debug(tempVar.RMS_From__c);
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
                RMS_Train__r.RMS_Weekday__c,
                RMS_IsReturn__c
                FROM RMS_TrainSchedule__c
                WHERE RMS_Train__c =: str_recordId
                AND RMS_Date__c=:date_journeyDate
                AND RMS_From__r.Name=:str_fromStation
                ORDER BY RMS_Distance__c ASC
                // RMS_ArrivalTimeTo__c ASC, RMS_DepartureTimeTo__c ASC
            ];
            // for(RMS_TrainSchedule__c obj:list_TrainSchedules){
            //     if (obj.RMS_IsReturn__c == true){
            //         bool_flag = true;
            //     }
            // }

            // if(bool_flag){
            //     for(integer i = list_TrainSchedules.size()-1;i>=0;i--){
            //             reversedList.add(list_TrainSchedules[i]);
            //     }
            //     return reversedList;
            // }
            // String str_route=String.valueOf(list_TrainSchedules[0].RMS_RouteNumber__c);
            // List<String> list_StationCodes = new List<String>();
            

            // RMS_Route__c obj_TrainRoute = [SELECT RMS_StationsCovered__c FROM RMS_Route__c WHERE Name =:str_route LIMIT 1]; 

            // list_StationCodes = obj_TrainRoute.RMS_StationsCovered__c.split(',');
            // System.debug('Codes: ' + list_StationCodes);

            // Set<string> set_ToStations = new Set<string>();
            // List<RMS_TrainSchedule__c> list_UpdatedTrainSchedule = new List<RMS_TrainSchedule__c>();

            // for(integer i=0;i+1<list_TrainSchedules.size();i++){
            //     if (list_TrainSchedules[i].RMS_From__r.Name == list_TrainSchedules[i+1].RMS_From__r.Name){
            //         list_TrainSchedules.remove(i);
            //     }
                
            // }

            // for(RMS_TrainSchedule__c obj:list_TrainSchedules) {
            //         if(list_StationCodes.contains(obj.RMS_To__r.RMS_StationCode__c)){
            //             list_UpdatedTrainSchedule.add(obj);
            //             System.debug(obj);
            //         }
            // }

            // for(RMS_TrainSchedule__c obj:s){
            //     system.debug('Data after filtering: '+s);
            // }

            // return list_UpdatedTrainSchedule;
            // List<RMS_TrainSchedule__c> s =list_TrainSchedules;
            // integer i;
        //     for(i=0; i+1<s.size()-1;i++){
               
        //         if(s[i].RMS_To__r.Name==s[i+1].RMS_To__r.Name){
        //             s.remove(i);
        //         }
        //         if(s[i].RMS_DepartureTimeTo__c == null){ 
        //             if(s[i].RMS_ArrivalTimeTo__c<s[i+1].RMS_ArrivalTimeTo__c){
        //                     s.remove(i);                                                                                                                                    
        //                 }
        //                 if(s[i].RMS_ArrivalTimeTo__c!=null && i==0){
        //                     s.remove(i);
        //             }
        //         }
               
        // }
        // s.remove(i);

        
        // if(s[i-1].RMS_To__r.Name != str_toStation){
        //     s.remove(i-1);
        // }
           
            
            return list_TrainSchedules;
            
    } catch (Exception e) {
        throw new AuraHandledException(e.getMessage());
    }
   }
}