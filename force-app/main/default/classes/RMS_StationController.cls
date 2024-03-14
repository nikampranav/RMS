/*******************************************************************************************************
* 
* @ Name            :   RMS_StationController
* @ Purpose         :   Controller for getting station details 
* @ Author          :   Anshika Augustine
* @ Usage           :   1) For searching the stations based on user inputs
*
*   Date            |  Developer Name                 |  Version      |  Changes
* ======================================================================================================
*   23-01-2024     |  anshika.augustine@absyz.com    |  1.0          |  Initial Version
*
*******************************************************************************************************/

public with sharing class RMS_StationController {
    

    /**
     * @ author       :  Anshika Augustine
     * @ description  :  This method is used to search the stations based on a key
    **/
    @AuraEnabled(cacheable=true)
    public static List<RMS_Station__c> listStationsByName(String strSearchKey) {
        String strKey = strSearchKey + '%';
        return [
            SELECT Id, 
            Name,
            RMS_StationCode__c
            FROM RMS_Station__c
            WHERE Name LIKE :strKey 
            WITH SECURITY_ENFORCED
        ];
    }
}