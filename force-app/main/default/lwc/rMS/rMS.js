import { LightningElement, track } from 'lwc';
import getStations from '@salesforce/apex/StationSearchController.getStations';

export default class StationSearch extends LightningElement {
    @track searchValue = '';
    @track stations = [];

    handleSearch(event) {
        this.searchValue = event.target.value;
        this.fetchStations(this.searchValue);
    }

    fetchStations(searchValue) {
        getStations({ searchValue })
            .then(result => {
                this.stations = result;
            })
            .catch(error => {
                console.error('Error fetching stations', error);
            });
    }
}