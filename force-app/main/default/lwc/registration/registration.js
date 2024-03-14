import { LightningElement } from 'lwc';
import registerUser from '@salesforce/apex/UserRegistration.registerUser';

export default class Registration extends LightningElement {
    uid = '';
    phone = '';
    password = '';

    handleUidChange(event) {
        this.uid = event.target.value;
    }

    handlePhoneChange(event) {
        this.phone = event.target.value;
    }

    handlePasswordChange(event) {
        this.password = event.target.value;
    }

    handleSubmit() {
        registerUser({ uid: this.uid, phone: this.phone, password: this.password })
            .then(result => {
                // If registration was successful, redirect the user to the login page
                if (result === 'You\'re successfully registered! Please login to continue.') {
                    window.location.href = '/login';
                } else {
                    // If there was an error, display it
                    this.error = result;
                }
            })
            .catch(error => {
                // Handle any other errors
                this.error = error;
            });
    }
}