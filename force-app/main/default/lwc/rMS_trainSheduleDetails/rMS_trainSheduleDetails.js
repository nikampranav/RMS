import { LightningElement,track,api, wire } from 'lwc';
import returnSchedule from '@salesforce/apex/RMS_TrainScheduleHandler.returnSchedule';
import getFieldLabels from '@salesforce/apex/RMS_TrainScheduleHandler.getFieldLabels';
import returnTrainDetails from '@salesforce/apex/RMS_TrainScheduleHandler.returnTrainDetails';
import { NavigationMixin } from 'lightning/navigation';
import {CurrentPageReference} from 'lightning/navigation';

export default class RMS_trainScheduleDetails extends NavigationMixin(LightningElement) {

@track rowOffset=0;
@track recordId;
@track tableData = [];
@track listLabels=[];
@track list_API=[];
@track list_scheduleData=[];  
@track columns=[];
@track str_TrainName;
@track str_TrainNumber;
@track str_Starting;
@track str_Destination;
str_recordId;    /*to be passed from previous component */
@track date_trainScheule;
@track url_trainRecord='/'+this.str_recordId;
@track url_scheduleRecord;
list_TrainDetails=[];
isLoadingData=true
isLoadingHeader=true
bool_first

FieldLabels = {};
options=[];
 
/* Method to Navigate to Train Schedule Record Page */
viewScheduleRecord(event){
    this[NavigationMixin.GenerateUrl]({
        type: 'standard__recordPage',
        attributes:{
            recordId:event.target.name,
            actionName: 'view',
        },
    }).then((url)=>{
        this.url_scheduleRecord=url;
        window.open(this.url_scheduleRecord,"_blank");
    })
}

/* Method to Navigate to Train Record Page */
viewTrainRecord(){
    this[NavigationMixin.GenerateUrl]({
        type: 'standard__recordPage',
        attributes:{
            recordId:this.str_recordId,
            actionName: 'view',
        },
    }).then((url)=>{
        this.url_trainRecord=url;
        window.open(this.url_trainRecord,"_blank");
    })
}

@wire(CurrentPageReference)
getPageReferenceParameters(currentPageReference){
   
        try{
            if(currentPageReference){
        let state = currentPageReference.attributes.state;
        console.log('state Sch: ',JSON.stringify(currentPageReference.attributes.state));
        this.str_Starting = state ? state.RMS_fromStation : '';
        this.str_Destination = state ? state.RMS_ToStation : '';
        this.date_trainScheule = state ? state.RMS_Date : '';
        this.str_recordId = state ? state.RMS_trainId : '' ;
            }
        }
        catch(e){
            console.log('Error with CurrentPageReference: ',e);
        }
    }
        
    
    



@wire(returnSchedule, { str_recordId: '$str_recordId',str_fromStation:'$str_Starting',str_toStation:'$str_Destination',str_date:'$date_trainScheule'})
wiredTrainSchedule({ error, data }) {
    if (data) {
        console.log('Fetched data: ', data);

        /*Assigning values to Train Labels*/
        data.forEach(item=>{
            this.str_TrainNumber=item.RMS_Train__r.RMS_TrainNo__c;
            this.str_TrainName=item.RMS_Train__r.Name;
            console.log('ArrTime:',typeof(item.RMS_ArrivalTimeTo__c));
        })

        /* Assigning Values to Weekday schedule labels*/
        const str_Options = data[0].RMS_Train__r.RMS_Weekday__c.split('|')
        str_Options.forEach(option=>{
            this.options.push({value:option,label:option});
        })


        this.list_scheduleData = data.map((item) => {
                return {
                    ...item,
                    RMS_ArrivalTimeTo__c: item.RMS_ArrivalTimeTo__c ? this.convertTime(item.RMS_ArrivalTimeTo__c) : '_',
                    RMS_DepartureTimeTo__c: item.RMS_DepartureTimeTo__c ? this.convertTime(item.RMS_DepartureTimeTo__c) : '_',
                }
        })
        console.log(this.list_scheduleData);
        
    } else if (error) {
        console.error('Error retrieving data:', error);
    } 
}

convertTime(int_duration) {
    let minutes = parseInt((int_duration/(1000*60))%60);
    let hours = parseInt((int_duration/(1000*60*60))%24);
    const unit = (hours <= 12) ? "AM" : "PM";

    hours = (hours >= 12) ? parseInt(hours / 2) : hours;    
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    
    return hours + ":" + minutes + ' ' + unit;
}

connectedCallback(){
    // returnTrainDetails({ str_recordId:this.str_recordId })
    // .then((result)=>{
    //     this.list_TrainDetails=result;
    //     this.list_TrainDetails.forEach(item=>{
    //         this.str_TrainName=item.Name;
    //         this.str_TrainNumber=item.RMS_TrainNo__c;
    //         this.str_Starting=item.RMS_Starting__c;
    //         this.str_Destination=item.RMS_Destination__c;
    //         const str_array=item.RMS_Weekday__c.split("|"); 
    //         this.options=str_array.map(weekday=>{
    //             return{
    //                 label:weekday,
    //                 value:weekday
    //             }
    //         })
    //     })
    //     })
    // .catch((error)=>{
    //     console.log('Error Retrieving Train Details ',error);
    // })
    this.bool_first=true
    getFieldLabels()
    .then((result)=>{
        this.FieldLabels = JSON.parse(JSON.stringify(result));
        this.listLabels=Object.keys(this.FieldLabels);
        this.listLabels.forEach(labels => 
            {
                this.list_API.push(this.FieldLabels[labels]);
            });
        this.columns = this.listLabels.map(labels=>({
            label:labels,
            fieldName:this.FieldLabels[labels]
        }))
        console.log(this.columns);
        console.log(typeof(this.columns));
        this.isLoadingHeader=false
        this.isLoadingData=false
    })
    .catch((error)=>{
        console.log('Retrieving Field and Labels Failed!'+ error);
    })   
}
}