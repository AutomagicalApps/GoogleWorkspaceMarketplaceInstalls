//get some analytics from Marketplace on installs
//https://developers.google.com/workspace/marketplace/use-analytics
//https://developers.google.com/workspace/marketplace/reference/rest

//changed from 20 to 80 back to 60 to 50and switched trigger from 1 min to 5 min
function getMarketplaceInfo(applicationId,timestamp,maxResults) {
  
  //var marketplaceURLToFetch = "https://appsmarket.googleapis.com/appsmarket/v2/licenseNotification/"+applicationId+"?alt=json&max-results="+maxResults;
  //then use timestamp
  var marketplaceURLToFetch = "https://appsmarket.googleapis.com/appsmarket/v2/licenseNotification/"+applicationId+"?alt=json&timestamp="+timestamp+"&max-results="+maxResults;
  
  var options = {
   method: "GET",
   muteHttpExceptions: true,
   headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }
  }
  var res = UrlFetchApp.fetch(marketplaceURLToFetch, options)
  res = JSON.parse(res.getContentText());
  var notifications = res.notifications;

  for (var i in notifications){
    var customerId = notifications[i].customerId;

    var installationDate = new Date(new Date().setTime(notifications[i].timestamp));
    var installationType = (customerId.indexOf('@') == -1) ? "DOMAIN" : "INDIVIDUAL";
   
  
    if(notifications[i].deletes){
      //they uninstalled
    }
    else if(notifications[i].provisions){
      //they re-installed now can do something like send them the Welcome email
     
    }
    else if(notifications[i].reassignments){
          //just the other option, we also get this with deletions so no need to record them
    }
    else{
      // they installed so do something like send Welcome email
    }
   
  }
}
