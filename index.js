
var admin = require("firebase-admin");

var serviceAccount = require("./newServ.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const db = admin.firestore();
const token = db.collection("admin").doc("adminId").get();

db.collection('shops').get().then(res=>{
    res.forEach((doc)=>{
        const shopName = doc.data()["shopName"]
        const shopId = doc.data()["shopId"];
         db.collection('shops').
         doc(doc.id).collection("stock").
         onSnapshot((snapshot)=>{
              snapshot.docChanges().forEach((change)=>{
                if (change.type=='modified' ) {
                    token.then(res=>{
                        const Token = res.data()["token"]
                        console.log(Token)
                        Token.forEach((tkn)=>{
                    console.log(`${shopName}:\n ${change.doc.data()["modelName"]} is ${change.doc.data()["onStock"]?"On stock":"Out of stock"}`)
                    const message = {
                        data:{shopId},
                           
                        
                        notification: {
                          title: shopName,
                          body: `${change.doc.data()["modelName"]} is ${change.doc.data()["onStock"]?"On stock":"Out of stock"}`,
                          imageUrl: change.doc.data()["modelImage"], 
                        },
                        token: tkn,   
                      };
                    
                    admin.messaging().send(message)
                      .then((response) => {
                        console.log('Successfully sent message:', response);
                      })
                      .catch((error) => {
                        console.error('Error sending message:', error);
                      });
                    })
                    })
                }
              })
         })
})})
