/*
* @ Name            :   RMS_SwitchTrigger
* @ Purpose         :   For toggleing between triggers.
* @ Author          :   Pranav Nikam  
* @ Usage           :   1)SwitchTrigger class is used to toggle between triggers for specific trigger requiremets.
*******************************************************************************************************

*   Date            |  Developer Name               |  Version      |  Changes
* ======================================================================================================
*   22-01-2024      |  pranav.nikam@absyz.com      |  1.0          |  Initial Version
*/

public class RMS_SwitchTrigger {
    public Boolean BlnActive {get; set;}

    public RMS_SwitchTrigger() {
        this.BlnActive = false;
    }

    public static RMS_SwitchTrigger getValue(String Strvalue) {
        RMS_SwitchTrigger ST = new RMS_SwitchTrigger();
        if(Strvalue == 'Deactivate') {
            ST.BlnActive = false;
        } else if(Strvalue == 'Activate') {
            ST.BlnActive = true;
        }
        return ST;
    }
}