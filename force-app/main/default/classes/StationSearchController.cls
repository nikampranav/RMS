public with sharing class StationSearchController {
    @AuraEnabled(cacheable=true)
    public static List<String> getStations(String searchValue) {

        String searchWildCard = '%' + searchValue + '%';
        List<RMS_Station__c> stationsList = [SELECT Name FROM RMS_Station__c WHERE Name LIKE :searchWildCard];


        //String query = 'SELECT Name FROM RMS_Station__c WHERE Name LIKE :\'%\' + searchValue + \'%\';
        //List<RMS_Station__c> stationList = Database.query(query);
        
        List<String> stationNames = new List<String>();
        for (RMS_Station__c station : stationsList) {
            stationNames.add(station.Name);
        }
        return stationNames;
    }
}