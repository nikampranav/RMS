/*
* @ Purpose         :   This class fetches and returns specific details of a station from Org.                      
* @ Author          :   Pranav nikam
* @ Usage           :   1)fetch and return the station Name 
*******************************************************************************************************
*
*   Date            |  Developer Name              |  Version      |  Changes
* ======================================================================================================
*   31-01-2024      |  pranav.nikam@absyz.com      |  1.0          |  Initial Version
*/

public with sharing class RMS_Train {
    @AuraEnabled(cacheable=true)
    public static list<sObject> fetchLookupData(string searchKey , string sObjectApiName) {    
        List < sObject > returnList = new List < sObject > ();

        string sWildCardText = '%' + searchKey + '%';
        Integer customLimit = Integer.valueOf(Label.CLRMS00001);
        string sQuery = 'Select Name From ' + sObjectApiName + ' Where Name Like : sWildCardText LIMIT:customLimit ';
        for (sObject obj: database.query(sQuery)) {
            returnList.add(obj);
        }
        return returnList;
    }
}