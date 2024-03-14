/*******************************************************************************************************
* 
* @ Name            :   RMS_CustomMetadataController
* @ Purpose         :   Controller for getting custom metadata details 
* @ Author          :   Anshika Augustine
* @ Usage           :   1) For getting the list of coach types 
                    2) For getting the list of train passes 
*
*   Date            |  Developer Name                |  Version      |  Changes
* ======================================================================================================
*   24-01-2024     |  anshika.augustine@absyz.com    |  1.0          |  Initial Version
*   25-01-2024     |  anshika.augustine@absyz.com    |  1.1          |  Added another method to get the 
                                                                    train passes list
*   30-01-2024     |  navaneeth.hari@absyz.com       |  1.2          |  Updated the method 
                                                                        
            
*******************************************************************************************************/

public with sharing class RMS_CustomMetadataController {

    /**
 * @ author       :  Anshika Augustine
 * @ description  :  This method is used to get the list of coaches to be seen as options 
                     in the All Classes combobox
**/

@AuraEnabled(cacheable=true)
public static List<RMS_DistancePricing__mdt> listGetMetadataValues(Integer intChoice){
    try {
        if(intChoice==1){
            Integer customLimit1 = Integer.valueOf(Label.CLRMS00002);
            return [ SELECT
                        MasterLabel, 
                        RMS_coachName__c
                        FROM 
                        RMS_DistancePricing__mdt
                        WHERE RMS_coachName__c!=:NULL
                        ORDER BY RMS_coachName__c DESC
                        LIMIT:customLimit1];
        }
        else if(intChoice==2){
            Integer customLimit2 = Integer.valueOf(Label.CLRMS00003);
            return [ SELECT
                        MasterLabel,           
                        RMS_passName__c	
                        FROM 
                        RMS_DistancePricing__mdt
                        WHERE RMS_passName__c!=:NULL
                        ORDER BY RMS_passName__c DESC
                        LIMIT:customLimit2];
        }
        else
        return NULL;

    } catch (Exception exceptionObj) {
        RMS_ErrorLog__c rmsLog = RMS_ErrorLogHandler.createErrorLog(
            'Coach and Passes value error',  // Name
            exceptionObj.getMessage(),  // Error Message
            'listGetMetadataValues', // Method Name (Replace with actual method name)
            'Distance Pricing Metadata Issue'
        );
        insert rmsLog;
        return NULL;
    }   
}
}