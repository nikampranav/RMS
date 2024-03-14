public with sharing class UserRegistration {
    @AuraEnabled
    public static String registerUser(String uid, String phone, String password) {
        // Query the database to see if the user already exists
        List<RMS_Passenger__c> existingUsers = [SELECT Id, Name,RMS_Username__c FROM RMS_Passenger__c WHERE RMS_Username__c = :uid OR RMS_MobileNo__c = :phone];

        // If the user already exists, return an error message
        if (!existingUsers.isEmpty()) {
            return 'Sorry! User with same UID or Phone already exists.';
        }

        // If the user doesn't exist, create a new user
        RMS_Passenger__c newPassenger = new RMS_Passenger__c();
        newPassenger.RMS_Username__c = uid;
        newPassenger.RMS_MobileNo__c = phone;
        newPassenger.RMS_Password__c = password; // Note: You might need to handle password hashing manually

        // Insert the new user into the database
        insert newPassenger;

        // Return a success message
        return 'You\'re successfully registered! Please login to continue.';
    }
}