import { LightningElement, track, wire } from 'lwc';
import listGetMetadataValues from '@salesforce/apex/RMS_CustomMetadataController.listGetMetadataValues';
import { NavigationMixin } from 'lightning/navigation';
export default class RMS_BookTicketScreen extends NavigationMixin(LightningElement) {

      data = [];
      searchKey;
      strFromStation;
      strToStation;
      @track selectedDate;
      @track currentDate; 
      classOptions = [];
      coachValue;
      @track intChoice=1;
      passOptions = [];
      passValue;       
      @track checkboxOptions = [
      { label: 'Person With Disability Concession', isChecked: false },
      { label: 'Flexible With Date', isChecked: false },
      { label: 'Train With Available Berth', isChecked: false },
      { label: 'Railway Pass Concession', isChecked: false }
  ];
    
    //Calls the child custom lookup component to lookup stations for 'From' & 'To' fields
    lookupRecord(event){
      console.log('selecetedRecord', event.detail.selectedRecord);
      const record = (event.detail.selectedRecord) ? event.detail.selectedRecord : '';
      const recordName = event.detail.recordName;
      this[recordName] = record;
      this.showTable = true;

      if(this.memberRecord) {
          this.fetchLookupData();
      }       
  }
        
    //Handling events for From Station
      handleSearchFrom(event){
          this.searchKey=event.target.value;
      }

      //Handling events for To station
      handleSearchTo(event){
      this.searchKey=event.target.value;  
    }
       
      //Handles the date field functionality
      connectedCallback() {
      // Initialize currentDate with the local date
      this.currentDate = new Date().toISOString().split('T')[0];
      this.selectedDate = this.currentDate; // Set the default selected date to the current date
  }
      handleDateChange(event) {
      this.selectedDate = event.target.value;        
  }
  
  //To get the coach as well as passes values from the metadata
  @wire(listGetMetadataValues,{intChoice:'$intChoice'})
  wiredCoaches({ error, data }) {
      if (data) {
          if (this.intChoice == 1){
          this.classOptions = data.map(coach => ({
              label: coach.RMS_coachName__c,
              value: coach.RMS_coachName__c
          }));
        }
        else if(this.intChoice == 2){
          this.passOptions = data.map(pass => ({
                      label: pass.RMS_passName__c,
                      value: pass.RMS_passName__c
        }));
      }
      } else if (error) {
        this.error = error;
        console.error('Error loading coaches:', error);
      }
  }

  handleCoach(event){
    this.coachValue=event.target.value;
    this.intChoice = 2;
  }


  handlePass(event){
    console.log(event.target.value);
    
    this.passValue=event.target.value;
    this.intChoice = 1;
  }
  
  //Handles the checkbox options
  handleCheckboxChange(event) {
    const label = event.target.dataset.label;
    const index = this.checkboxOptions.findIndex(option => option.label === label);
    if (index !== -1) {
        this.checkboxOptions[index].isChecked = event.target.checked;
    }
}

//Handles the navigation from screen 1 to the next screen
handleSearch() {  
  if (this.strFromStation && this.strToStation && this.selectedDate && this.coachValue) {
  // Navigate to the search result page
      this[NavigationMixin.Navigate]({
          type: 'standard__navItemPage',
          attributes: {
              apiName:"RMS_searchResult",
              state: {
                RMS_fromStation: this.strFromStation.Name,
                RMS_ToStation: this.strToStation.Name,
                RMS_Date: this.selectedDate,
                RMS_Coach: this.coachValue,
              }   
          }
      });
  } else {
      const errorMessage = 'Please fill in all the required fields.';
      this.showNotification('Error', errorMessage, 'error', 'sticky');       
  }
}

// Reset the input values or any other state you want to clear
handleCancel() {
  try {     
    this.coachValue = '';
    this.passValue = '';
    this.selectedDate = this.currentDate;    
} catch (error) {
    console.error('Error in handleCancel:', error);
}
}

//Function that implements the toast message
showNotification(title, errorMessage, variant, mode){
this.dispatchEvent(
  new ShowToastEvent({
      title: title,
      message: errorMessage,
      variant: variant,
      mode: mode
  })
);
}
}