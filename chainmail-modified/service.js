/* ChainMail backend service
 * 
 * @spartacusrex
 * Modified to receive messages from other MiniDapps via MDS.comms
 */

//Load js libs
MDS.load("./js/jslib.js");
MDS.load("./js/sql.js");
MDS.load("./js/txns.js");

var logging = false;

//Is this coin mail for us..
function processNewMessage(coin){
	
	try{
		//Does it have a message..
		if(coin.address == CHAINMAIL_ADDRESS && coin.state && coin.state[99]){
			
			//Is this message for us
			checkEncryptedData(coin.state[99],function(success, message){
				if(success){
					//It for us!
					if(logging){
						MDS.log("New Message "+JSON.stringify(message));	
					}
					
					//Add to the database..
					insertMessage(message, true, function(added){
						
						if(added){
							
							var shorter = message.message;
							if(message.message.length > 50){
								shorter = message.message.substr(0,50)+"..";
							}
							
							//Notify the User
							MDS.notify(message.fromname+" : "+shorter);
							
							var notif 		= {};
							notif.type 		= "NEWMAIL";
							notif.subject	= message.subject;
							notif.from 		= message.fromname;
							notif.message 	= shorter;
							
							//Send a message to the front end..
							MDS.comms.solo(JSON.stringify(notif));	
						}
					});				
				}
			});
		}	
		
	}catch(error){
		MDS.log(error);
	}
}

//Send a message received via comms
function sendReceivedMessage(msgData, callback) {
	try {
		if (msgData.type !== "SEND") {
			if (logging) MDS.log("Received non-SEND message type: " + msgData.type);
			callback && callback(false, "Unknown message type");
			return;
		}
		
		if (!msgData.topublickey || !msgData.fromname || !msgData.message) {
			if (logging) MDS.log("Missing required fields in SEND message");
			callback && callback(false, "Missing required fields");
			return;
		}
		
		//Construct the sendjson
		var sendjson = {
			topublickey: msgData.topublickey,
			fromname: msgData.fromname || "Unknown",
			subject: msgData.subject || "Message",
			message: msgData.message
		};
		
		if (logging) {
			MDS.log("Sending message from comms: " + JSON.stringify(sendjson));
		}
		
		//Use ChainMail's existing sendMessage function
		sendMessage(sendjson, function(success, response) {
			if (logging) {
				if (success) {
					MDS.log("Comms message sent successfully");
				} else {
					MDS.log("Comms message send failed: " + response);
				}
			}
			callback && callback(success, response);
		});
		
	} catch(error) {
		MDS.log("Error in sendReceivedMessage: " + error);
		callback && callback(false, error);
	}
}

//Main message handler..
MDS.init(function(msg){
	
	//Do initialisation
	if(msg.event == "inited"){
		
		//Create the DB
		createDB(function(){
			
			//Listen for coins..
			MDS.cmd("coinnotify action:add address:"+CHAINMAIL_ADDRESS,function(startup){});
		});
		
	}else if(msg.event == "NOTIFYCOIN"){
		if(msg.data && msg.data.address == CHAINMAIL_ADDRESS){
			processNewMessage(msg.data.coin);
		}	
		
	}else if(msg.event == "MDSCOMMS"){
		//Handle incoming messages from other MiniDapps
		if(msg.data) {
			var isPublic = msg.data.public;
			
			//Private message to this MiniDapp
			if(!isPublic) {
				try {
					var incoming = JSON.parse(msg.data.message);
					if (incoming.type === "SEND") {
						MDS.log("Received SEND message via comms");
						sendReceivedMessage(incoming, function(success, response) {
							//For private messages, we could reply
						});
					}
				} catch(e) {
					MDS.log("Error parsing private comms message: " + e);
				}
			}
			//Public broadcast message
			else {
				try {
					var incoming = JSON.parse(msg.data.message);
					if (incoming.type === "SEND") {
						MDS.log("Received broadcast SEND message from: " + incoming.fromname);
						sendReceivedMessage(incoming, function(success, response) {
							if (logging) {
								if (success) {
									MDS.log("Broadcast message sent successfully");
								} else {
									MDS.log("Broadcast message send failed: " + response);
								}
							}
						});
					}
				} catch(e) {
					MDS.log("Error parsing broadcast message: " + e);
				}
			}
		}
	}
});
