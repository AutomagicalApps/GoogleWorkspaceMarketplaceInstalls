//bring in the Google Auth package
const { GoogleAuth } = require('google-auth-library');
//bring in our configuration json file
const project_cred = require('configuration.json');

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.installManagement = async (request, response) => {
  //bring in the privateKey and replace it with our secret key trick
  //I don't remember why we had to do this but it solved the issue
  //might no longer be needed

  // secret key trick: .replace(/\\n/g, '\n')
    let privateKey = project_cred.gapi.privateKey;
    let privateKeyReplaced = privateKey.replace(/\\n/g, '\n');

  // initialize Google Auth with the scope for Marketplace API with the projectId and credentials
      const auth = new GoogleAuth({
          scopes: 'https://www.googleapis.com/auth/appsmarketplace.license',
          projectId: project_cred.gapi.project_id,
          credentials: {
              client_email: project_cred.gapi.client_email,
              private_key: privateKeyReplaced
          }
      });
  //12 minutes because function runs every 10 minutes but add a little bit to be sure (execution time in mind).
  const sinceLastExecution = 12*60*1000;
  const timeStampParam = new Date().getTime() - sinceLastExecution;

  const client = await auth.getClient();
  const url = "https://appsmarket.googleapis.com/appsmarket/v2/licenseNotification/" +
        project_cred.publishedApp.application_id + "?alt=json&timestamp=" + timeStampParam;

  const res = await client.request({ url });

  // should be response of the api call for marketplace installs
  const notifications = res.data.notifications;
 
  // loop through notifications
    const promises = notifications.map(async notification => {
        const customerId = notification.customerId;
        const installationDate = new Date(new Date().setTime(notification.timestamp));
        // customerId can be erwin@gmail.com or domain.com
        const isInstallationTypeDomain = (customerId.indexOf('@') === -1);

        
        // check if the customerId already exists first (I use Firebase RTDB with a ref, 
        // using the firebase-admin package, not shown here). 
        // This is a promise that will return if the entry exists.
        // 1. it will make the RTDB reference based on the installationType 
        // (domain/individual)
        // 1b. in case of individual, we'll encode the email to build the proper ref

        let ref;

        let entryExists = await new Promise((resolve, reject) => {

            if(isInstallationTypeDomain) {

                // Do stuff for domain
                // Build ref for domain
                ref = db.ref("whateverPathYouChoose");
            } else {

                // Do stuff for individual install 
                
                ref = db.ref("whateverPathYouChoose");
            }

            // Check if ref exists
            return ref.once("value", (snapshot) => {
                if (snapshot.exists()) {
                    return resolve(true);
                } else {
                    return resolve(false);
                }
            }).catch((error) => {
                // uh-oh!
                reject(error);
            });
        });

        // If the user/domain is already in the RTDB
        if(entryExists) {
            const now = new Date();
            const nowTime = now.getTime();

            // Handle a delete
            if(notifications.deletes) {
                console.log(customerId + " just deleted the app.");

                // write deletion time in firebase so we can see if they quickly delete
                let update = await ref.update({ 'deletedAt': nowTime });

                // do more stuff if you want like remove from email contact list
                //let remove = await removeFromContact(customerId)

                return Promise.all([update]);

            } else if(notifications.provisions) {
                // handle a provision. provisions means reinstalled

                console.log(customerId + " just provisions when already existed in RTDB so they reinstalled.");

                // save reinstall date and count
                let update = await ref.update({ 'reinstalledAt': nowTime });

                // do more stuff 
              

                return Promise.all([update]);
            } else {
                console.log("Just check if " + customerId + " is still on contact list.");

                // Perhaps we have check a user twice because of the 2-minute extra checking (see earlier)
                // check if still on contact list and maybe do some stuff

                return true;
            }
        } else {
            // user does not exist in RTDB yet (maybe installed but not opened yet)
            console.log(customerId + " doesn't exist in RTDB yet!");

            //do some stuff for new customers

            return await ref.update({ userOnContactList: true, userInstalledAt: installationDate});
        }
    });

    // end function
    return await Promise.all(promises);
};
