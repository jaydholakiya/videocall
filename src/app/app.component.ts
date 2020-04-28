import { Component, OnInit, ViewChild } from "@angular/core";
import { AngularFireDatabase } from "@angular/fire/database";
import { AngularFireAuth } from "@angular/fire/auth";
import * as firebase from 'firebase';

/**
 * Server urls
*/

const SERVERS: any = {
  iceServers: [
    { urls: "stun:stun.services.mozilla.com" },
    { urls: "stun:stun.l.google.com:19302" }
  ]
};

const DEFAULT_CONSTRAINTS = {
  optional: []
};

declare let RTCPeerConnection: any;

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})

export class AppComponent implements OnInit {

  /**
   * Variables for videocall
  */

  pc: any;
  channel;
  database: firebase.database.Reference;
  user: firebase.User;
  senderId: string;

  /*
   *  Video parts for me and opponent side
  */
  
  @ViewChild("me") me: any;
  @ViewChild("remote") remote: any;

  constructor( public afDb: AngularFireDatabase, public afAuth: AngularFireAuth ) {}

  ngOnInit() {
    this.setupWebRtc();
  }

  setupWebRtc() {

    /*
      Database for the offer and answer part of request 
    */

    this.senderId = this.guid();
    var channelName = "/webrtc";
    this.channel = this.afDb.list(channelName);
    this.database = this.afDb.database.ref(channelName);
    this.database.on("child_added", this.readMessage.bind(this));
    this.pc = new RTCPeerConnection(SERVERS, DEFAULT_CONSTRAINTS);
    this.pc.onicecandidate = event => event.candidate ? this.sendMessage(this.senderId,JSON.stringify({ ice: event.candidate }))
        : console.log('Sent');
          this.pc.ontrack = event =>
      (this.remote.nativeElement.srcObject = event.streams[0]); // use ontrack
    this.showMe();
  }

  /**
   * 
   * @param senderId Generated sender id
   * @param data Message data
  */

  sendMessage(senderId, data) {
    var msg = this.channel.push({
      sender: senderId,
      message: data
    });
    msg.remove();
  }

  /**
   *@param data For reading the data on firebase database 
  */

  readMessage(data) {
    if (!data) return;
    var msg = JSON.parse(data.val().message);
    var sender = data.val().sender;
    if (sender != this.senderId) {
      if (msg.ice != undefined)
        this.pc.addIceCandidate(new RTCIceCandidate(msg.ice));
      else if (msg.sdp.type == "offer")
        this.pc.setRemoteDescription(new RTCSessionDescription(msg.sdp)).then(() => this.pc.createAnswer())
          .then(answer => this.pc.setLocalDescription(answer))
          .then(() =>
            this.sendMessage(
              this.senderId,
              JSON.stringify({ sdp: this.pc.localDescription })
            )
          );
      else if (msg.sdp.type == "answer")
        this.pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
    }
  }

  /**
   *  For showing our video data in HTML DOM 
  */
  
  showMe() {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then(stream => (this.me.nativeElement.srcObject = stream))
      .then(stream => this.pc.addStream(stream));
  }

  /*
   *   For showing opponent's video in HTML DOM
  */

  showRemote() {
    this.pc
      .createOffer()
      .then(offer => this.pc.setLocalDescription(offer))
      .then(() => this.sendMessage(this.senderId,JSON.stringify({ sdp: this.pc.localDescription })));
  }

  guid() {
    return this.s4() + this.s4() + "-" + this.s4() + "-" + this.s4() + "-" + this.s4() + "-" + this.s4() + this.s4() + this.s4();
  }

  s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
}