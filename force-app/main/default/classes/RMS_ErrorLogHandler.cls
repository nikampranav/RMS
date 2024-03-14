/*
* @ Name            :   RMS_ErrorLogHandler
* @ Purpose         :   for creating error logs.
* @ Author          :   Anshika Augustine 
* @ Usage           :   For generating the records logging the errors caught in the various methods.
*******************************************************************************************************

*   Date            |  Developer Name                   |  Version      |  Changes
* ======================================================================================================
*   07-02-2024      |  anshika.augustine@absyz.com      |  1.0          |  Initial Version
*/

public class RMS_ErrorLogHandler {
    public static RMS_ErrorLog__c createErrorLog(string strName, string strErrorMessage, 
                                                 string strMethodName, string strType)
    {
        RMS_ErrorLog__c RMSLog = new RMS_ErrorLog__c();
        RMSLog.Name=strName;
        RMSLog.RMS_ErrorMessage__c=strErrorMessage;
        RMSLog.RMS_MethodName__c=strMethodName;
        RMSLog.RMS_Type__c=strType;
        return RMSLog;
    }
}