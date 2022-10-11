function sendEmailByMailJet(emailAddress) {
//throw in their email into the body of the email sent to me for testing
var user = "**********************************";
var url = 'https://api.mailjet.com/v3.1/send';
var header = 'Content-Type: application/json'; 
var data ={
  "Messages":[
    {
      "From": {
        "Email": "support@automagicalapps.com",
        "Name": "Automagical Forms"
      },
      "To": [
        {
          "Email": emailAddress,
        }
      ],
      "TemplateID": '********',
      "TemplateLanguage": true,
      "Subject": "Get started with Automagical Forms",
      "CustomCampaign":"AutomagicalFormsOnboarding",
      "Variables": {}
    }
  ]
};
  var options = {
    method: "POST",
    "Content-Type": 'application/json',
    muteHttpExceptions: true,
    headers: {
      "Content-Type": 'application/json',
      Authorization: 'Basic ' + Utilities.base64Encode(user)
    },
    payload: JSON.stringify(data)
  };
  var res = UrlFetchApp.fetch(url, options);
  console.log('Mailjet res: ',res);
  
  }
