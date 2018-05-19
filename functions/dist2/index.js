'use strict';var _extends=Object.assign||function(a){for(var c,b=1;b<arguments.length;b++)for(var d in c=arguments[b],c)Object.prototype.hasOwnProperty.call(c,d)&&(a[d]=c[d]);return a},URL=require('url-parse'),uport=require('uport'),uuid=require('uuid/v1'),ethers=require('ethers'),express=require('express'),admin=require('firebase-admin'),functions=require('firebase-functions'),cors=require('cors')({origin:!0}),db=require('./database'),Credentials=uport.Credentials,SimpleSigner=uport.SimpleSigner,serviceAccount=require('../secrets/service_account.json'),databaseURL='https://buidlbox-dev.firebaseio.com',uportSimpleSigner=SimpleSigner('d12d8a5c643ab7facc0a1815807aba1bed174762a2061b6b098b7bffd7462236'),uportCredentials=new Credentials({appName:'Eidenai',address:'2oo7fQjxR44MnKa8n4XKDZBBa2Buty4qrug',signer:uportSimpleSigner,networks:{"0x4":{registry:'0x2cc31912b2b0f3075a87b3640923d45a26cef3ee',rpcUrl:'https://rinkeby.infura.io'}}});admin.initializeApp({credential:admin.credential.cert(serviceAccount),databaseURL:databaseURL});var firestore=admin.firestore();exports.identity=functions.https.onRequest(function(a,b){cors(a,b,function(){var c=a.body.JWT;uportCredentials.receive(c).then(function(d){d.name&&admin.auth().updateUser(d.address,{displayName:d.name}),d.avatar&&admin.auth().updateUser(d.address,{photoURL:d.avatar.uri}),admin.auth().createCustomToken(d.address).then(function(e){b.json(e).send(),db.databaseWrite({writeType:'update',branch:['users',d.address,'profile'],payload:_extends({},d)})}).catch(function(e){b.send(e),console.log('Error creating custom token:',e)})}).catch(function(d){b.send(d),console.log('Error creating custom token:',d)})})}),exports.identityCallback=functions.https.onRequest(function(a){var c=a.query.uid,d=a.body.access_token;db.databaseWrite({writeType:'update',branch:['request','login',c,'data'],payload:{JWT:d}})}),exports.attestationRequest=functions.database.ref('/request/{type}/{request}').onCreate(function(a){var b=a.data.key,c=a.data.val();if(c.meta.status)switch(c.meta.status){case'initialized':switch(c.meta.type){case'login':return loginGenerate(c,b);case'attestation':return attestationGenerate(c,b);}default:}});var loginGenerate=function(a,b){return uportCredentials.createRequest({requested:a.input.requested,notifications:a.input.notifications,callbackUrl:'https://us-central1-buidlbox-dev.cloudfunctions.net/identityCallback?uid='+b}).then(function(c){db.databaseWrite({writeType:'update',branch:['request','login',b],payload:{data:{qr:'me.uport:me?requestToken='+c},meta:{status:'requested',type:'login'}}})})},attestationGenerate=function(a){return console.log(a),db.databaseSearch({branch:['users'],boundaries:{child:a.meta.uid}}).then(function(c){console.log(c),uportCredentials.attest({sub:c[0].address,claim:_extends({},a.data)}).then(function(d){console.log(c[0].pushToken),console.log(c[0].publicEncKey);uportCredentials.push(c[0].pushToken,c[0].publicEncKey,{url:'me.uport:add?attestations='+d,message:'Hello Kames'}).then(function(g){console.log(g)})}).catch(function(d){return console.log(d)})})};exports.authenticationComplete=functions.auth.user().onCreate(function(a){var b={"google.com":'google',"github.com":'github',"twitter.com":'twitter',"facebook.com":'facebook'}[a.data.providerData.providerId],c={eid:a.data.uid,images:{imageProfile:a.data.photoURL},name:{nameDisplay:a.data.displayName,nameFirst:a.data.displayName},contact:{contactEmail:a.data.email},metadata:{metadataAccountType:b||!1},provider:a.data.providerData};firestore.collection('people').add(c)}),exports.transferToken=functions.https.onRequest(function(a,b){var j=new ethers.providers.InfuraProvider('rinkeby',''),k=new ethers.Wallet('',j),l=new ethers.Contract('',[],k),m=l.transfer('',100*1);return m.then(function(){return console.log('SUCCESS'),b.redirect(303,'/')}).catch(function(n){return console.log('FAILURE'),console.log(n),b.redirect(404,n)})});
//# sourceMappingURL=index.js.map