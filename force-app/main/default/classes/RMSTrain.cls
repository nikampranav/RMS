public with sharing class RMSTrain {
    @AuraEnabled(cacheable=true)
    public static list<sObject> fetchLookupData(string searchKey , string sObjectApiName) {    
        List < sObject > returnList = new List < sObject > ();

        string sWildCardText = '%' + searchKey + '%';
        string sQuery = 'Select Name From ' + sObjectApiName + ' Where Name Like : sWildCardText LIMIT 10';
        for (sObject obj: database.query(sQuery)) {
            returnList.add(obj);
        }
        return returnList;
    }
}