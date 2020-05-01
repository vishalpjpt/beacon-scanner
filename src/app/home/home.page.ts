import { Component, NgZone } from '@angular/core';

import { Platform, ToastController } from '@ionic/angular';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';

declare var cordova: any;
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  providers: [ LocalNotifications ]
})
export class HomePage {

  private delegate: any = null;
  public beaconRegion: any = null;

  private beaconIndentifier: string = 'covidBeacon';
  public uuid = 'ffffffff-bbbb-cccc-dddd-eeeeeeeeeeee';

  public statusArr:string[] = [];

  constructor(
    private platform: Platform,
    private localNotifications: LocalNotifications,
    private toastController: ToastController,
    private zone: NgZone
  ) {
    platform.ready().then(() => {
      if(this.platform.is('ios')){
        // this.ibeacon.requestAlwaysAuthorization();
        cordova.plugins.locationManager.requestAlwaysAuthorization()
      }

      console.log("[beacon] platform ready");
      this.delegate = new cordova.plugins.locationManager.Delegate();

      this.delegate.didDetermineStateForRegion =  (pluginResult) => {
        console.log('[beacon] didDetermineStateForRegion ',pluginResult)
        let {state} = pluginResult;
        if(state) this.pushStateToArr(state);
        // Schedule a single notification
        this.localNotifications.schedule({
          id: Date.now(),
          text: `BLE Detected State: ${state}`
        });
      };

      this.delegate.didStartMonitoringForRegion = (pluginResult) => {
        console.log('[beacon] didStartMonitoringForRegion ',pluginResult)
      };

      this.delegate.didRangeBeaconsInRegion =  (pluginResult) => {
        console.log('[beacon] didRangeBeaconsInRegion ',pluginResult)
      };
    });
  }

  pushStateToArr(state: string){
    this.zone.run(()=>{
      if(this.statusArr.length < 20){
        this.statusArr.unshift(state);
      }
      else{
        this.statusArr.unshift(state)
        this.statusArr.pop();
      }
      console.log(this.statusArr);
    });
  }

  async showToast(msg) {
		const toast = await this.toastController.create({
			message: msg,
			duration: 2000
		});
		toast.present();
	}

  create(){
    // this.beaconRegion = this.ibeacon.BeaconRegion(this.beaconIndentifier,this.uuid);
    var minor = 1000; // optional, defaults to wildcard if left empty
    var major = 5; // optional, defaults to wildcard if left empty
    this.beaconRegion = new cordova.plugins.locationManager.BeaconRegion(this.beaconIndentifier, this.uuid, major, minor);
    console.log("[beacon] created",this.beaconRegion);
  }

  startMonitoring(){
    //  var minor = 1000;
    //  var major = 5;
    if(this.uuid && this.uuid.trim() != ''){
      try{
        this.beaconRegion = new cordova.plugins.locationManager.BeaconRegion(this.beaconIndentifier, this.uuid);
        console.log(this.beaconRegion);
        cordova.plugins.locationManager.setDelegate(this.delegate);
        cordova.plugins.locationManager.startMonitoringForRegion(this.beaconRegion)
        .fail((e) => {
          console.error(e);
          this.showToast("Unable to start monitor. UUID may be invalid.");
        })
        .done();
      }
      catch(e){
        console.log("Exception: ",e);
        this.showToast("Unable to start monitor. UUID may be invalid.");
      }
    }
    else{
      this.showToast("Please enter a valid uuid to start monitoring.");
    }
  }

  stop(){
    // this.ibeacon.stopMonitoringForRegion(this.beaconRegion);
  }

  async scan(){
    let uuid = '00000000-0000-0000-0000-000000000000';
    let identifier = 'beaconOnTheMacBooksShelf';
    let minor = null;
    let major = null;
    let beaconRegion = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid);

    cordova.plugins.locationManager.startRangingBeaconsInRegion(beaconRegion)
    .fail((e) => { 
      console.error(e); 
      this.showToast("Unable to start scan");
    })
    .done(() => {
      this.showToast("Scan started.");
    });      
  }
}
