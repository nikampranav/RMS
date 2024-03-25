import LightningModal from 'lightning/modal';
import {track,api, wire } from 'lwc';
import returnSchedule from '@salesforce/apex/RMS_TrainScheduleHandler.returnSchedule';
import getFieldLabels from '@salesforce/apex/RMS_TrainScheduleHandler.getFieldLabels';
import { NavigationMixin } from 'lightning/navigation';

export default class PassModal extends LightningModal {
    @api values={};
    @track rowOffset=0;
    @track recordId;
    @track tableData = [];
    @track listLabels=[];
    @track list_API=[];
    @track list_scheduleData=[];  
    @track columns=[];
    @track str_TrainName;
    @track str_TrainNumber;
    strLabelHeader='';
    @track str_Starting;
    @track str_Destination;
    str_recordId;    /*to be passed from previous component */
    @track date_trainScheule;
    list_TrainDetails=[];   
    isLoadingData=true
    isLoadingHeader=true
    bool_first

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

        let i=0;
        this.list_scheduleData = data.map((item) => {
                i+=1;
                return {
                    ...item,
                    RMS_ArrivalTimeTo__c: item.RMS_ArrivalTimeTo__c ? this.convertTime(item.RMS_ArrivalTimeTo__c) : '_',
                    RMS_DepartureTimeTo__c: item.RMS_DepartureTimeTo__c ? this.convertTime(item.RMS_DepartureTimeTo__c) : '_',
                    RMS_HaltTime__c: item.RMS_HaltTime__c ? item.RMS_HaltTime__c: '0',
                    RMS_Index__c: i
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
        console.log('Values are',this.values);
        this.str_Starting = this.values.RMS_fromStation;
        this.str_Destination = this.values.RMS_ToStation;
        this.date_trainScheule = this.values.RMS_Date;
        this.str_recordId = this.values.RMS_trainId;
        this.strLabelHeader = this.values.RMS_TrainName+ ' Schedule';
        if (this.str_Destination && this.str_Starting && this.date_trainScheule && this.str_recordId){
            console.log('All Values Fetched')

        }
        else{
            console.log('Not all Values Fetched')
        }
        
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

    renderedCallback(){
       // super.renderedCallback()
        this.applyAnimation()
    }

    applyAnimation(){
        const modalWrapper = this.template.querySelector('.modal-wrapper');
        if(modalWrapper){
            modalWrapper.classList.add('animate-fade-in')
        }
    }
}