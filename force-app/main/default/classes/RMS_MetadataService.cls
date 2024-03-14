/*
* @ Purpose         :   This class fetches and returns the coaches name                      
* @ Author          :   Pranav nikam
* @ Usage           :   1) store the coaches names in the form of list
*******************************************************************************************************
*
*   Date            |  Developer Name              |  Version      |  Changes
* ======================================================================================================
*   31-01-2024      |  pranav.nikam@absyz.com      |  1.0          |  Initial Version
*/


public with sharing class RMS_MetadataService {

/**
* @ author       :  Nikam Pranav
* @ description  :  This method is used to store the value of coaches in the form of list 
*                   
**/

@AuraEnabled(cacheable=true)
public static List<String> List_getJourneyClassOptions() {

return new List<String>{'AC First Class (1A)', 
                        'General(GEN)', 
                        'AC Executive Class(EC)', 
                        'AC Chair Car(CC)',
                        'AC 3 Tier (3A)',
                        'AC 2 Tier (2A)',
                        'Sleeper(SL)',
                        'All Classes'};
}
}