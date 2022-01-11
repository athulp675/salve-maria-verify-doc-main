var leadId;
var entity;
var leadDetails;
var button = document.getElementById("btnsubmit");
var togglebtn = document.getElementById("togglebtn");
var status_select = document.querySelector(".status-select");
console.log(status_select);
togglebtn.addEventListener("click", controlButton);
var previewbtn= document.getElementById("previewBtn");

var modalSubmitButton = document.getElementById("modalsubmit");

//**********************************Page On Load**********************************************/
//While loading the page for first time the entity has been fetched
//Function fetch data has been initiated to display the related records
ZOHO.embeddedApp.on("PageLoad", function (data) {
    console.log(data);
    leadId = data.EntityId;
    entity = data.Entity;
    console.log(`Entity=${entity}`);
    console.log(`Entity Id=${leadId}`);
    // const resp=ZOHO.CRM.API.getRelatedRecords({Entity:"Leads",RecordID:leadId,RelatedList:"Candidate_Documents_Verify"})
    // console.log(resp)
    fetchData();
    getFIle();
});


//******************************************FUNCTIONS***************************************************/

//>>>>>>>>>>>>>>>>Fetch Details from module and show it in the table 
function fetchData() {
    document.getElementById("tablebody").innerHTML = "";
    var resp_related = ZOHO.CRM.API.searchRecord({
        Entity: "Candidate_Documents",
        Type: "criteria",
        Query: `(Lead:equals:${leadId})`,
        delay: false,
    }).then(function (resp) {
        console.log(resp.data);
        if (resp.data != undefined) {
            var tablebody = document.getElementById("tablebody");
            resp.data.forEach((element) => {
                var row = tablebody.insertRow(0);
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                var cell3 = row.insertCell(2);
                var cell4 = row.insertCell(3);
                var cell5 = row.insertCell(4);

                cell1.innerHTML = element.Name;
                // var previewtable = document.createElement("button");
                // // previewtable.setAttribute("data-toggle", "collapse");
                // // previewtable.setAttribute("data-target", "#body");
                // previewtable.innerHTML = "Preview";
                // previewtable.id= "previewBtn";
                // previewtable.href="https://crmsandbox.zoho.com/crm/org765011388/specific/ViewAttachment?fileId=i5jwtcf7873e2a57f4a5db7df7fe2ef98e107&module=CustomModule7&parentId=4995768000000589006&creatorId=4995768000000345157&id=4995768000000589007&name=pdf.pdf&downLoadMode=pdfViewPlugin";
                // previewtable.target = "_blank";
                // previewtable.className= "btn info";
                var dwnldlink= element.Document[0].download_Url;
                // console.log(dwnldlink);
                var previewtable= document.createElement("a");
                previewtable.href = "https://crmsandbox.zoho.com"+ dwnldlink;
                previewtable.className = "btn info";
                previewtable.innerHTML = "Preview";
                previewtable.target = "_blank";
                cell1.appendChild( previewtable);

                cell2.innerHTML = element.Document_Type;
                cell2.style = "max-width: 35px;";
                cell3.style = "max-width: 35px;";
                if (element.Document) {
                    console.log("Document");
                    console.log(element.Document);
                    cell3.innerHTML = element.Document[0].file_Name;}
                    else if(modalSubmitButton.click==true){
                        cell3.innerHTML= element.data[0].details.name
                    }

                
                    var uploadfile = document.createElement("button");
                    uploadfile.type = "button";
                    uploadfile.setAttribute("data-toggle", "modal");
                    uploadfile.setAttribute("data-target", "#uploadModal");
                    uploadfile.innerHTML = "Edit File";
                    uploadfile.className = "btn info";
                    uploadfile.onclick = () => {
                        
                        //**Updating element id to the modal form */
                        console.log("editclicked");
                        document.getElementById("uploadrecordId").value = element.id;
                        document.getElementById("modaldocname").value= element.Name;
                        document.getElementById("modalfiletype").value= element.Document_Type;
                        document.getElementById("modalfilestatus").value= element.Document_Status;
                        // document.getElementById("uploadfile").value= element.file_Name;

                        
                          
                    };
                    cell3.appendChild(uploadfile); 
                
                

                var values = ["Pending", "Received", "Verified"];
                var select = document.createElement("select");
                select.name = "status";
                select.id = element.id;
                for (const val of values) {
                    var option = document.createElement("option");
                    option.value = val;
                    option.text = val.charAt(0).toUpperCase() + val.slice(1);
                    select.appendChild(option);
                }
                select.value = element.Document_Status;
                //*******updating the candidate document when it is edited */
                select.onchange = () => {
                    console.log(`Changed docid=${element.id}`);
                    if (select.value != "Verified") {
                        var config = {
                            Entity: "Candidate_Documents",
                            APIData: {
                                id: element.id,
                                Document_Status: select.value,
                            },
                        };
                        console.log(config);
                        ZOHO.CRM.API.updateRecord(config).then(function (data) {
                            console.log(data);
                        });
                    } else {
                        console.log("clicked on verified");
                        document.getElementById("remarkrecordId").value =
                            element.id;
                        $("#remarkModal").modal("show");
                    }
                };
                select.className = "form-control status-select";

                cell4.appendChild(select);

                var viewRecord = document.createElement("a");
                viewRecord.href = "https://crmsandbox.zoho.com/crm/org765011388/specific/ViewAttachment?fileId=i5jwtcf7873e2a57f4a5db7df7fe2ef98e107&module=CustomModule7&parentId=4995768000000589006&creatorId=4995768000000345157&id=4995768000000589007&name=pdf.pdf&downLoadMode=pdfViewPlugin";
                viewRecord.className = "btn btn-primary";
                viewRecord.innerHTML = "View Record";
                viewRecord.target = "_blank";
                cell5.appendChild(viewRecord);
            });
        }
    });
}



//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Control Toggle<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

function controlButton() {
    console.log("Clicked on Toggle Button");
    if (togglebtn.innerHTML === "Add New File") {
        document.getElementById("table").classList.add("hide");
        togglebtn.innerHTML = "Close X";
        togglebtn.classList.toggle("bg-danger");
        document.getElementById("formelements").style = "display:inherit";
    } 
    else {
        togglebtn.innerHTML = "Add New File";
        togglebtn.classList.toggle("bg-danger");
        document.getElementById("formelements").style = "display:none";
        document.getElementById("table").classList.remove("hide");
    }
}
/////////////////////////Previe Button/////////////////

// function previewButton(){
//     console.log("preview button clilcked");
//     if(previewbtn.innerHTML==="Preview"){
//         document.getElementById("table").classList.add("hide");
//         togglebtn.innerHTML = "Close X";
//         togglebtn.classList.toggle("bg-danger");
//         document.getElementById("body").style = "display:inherit";
//     }
    
// }


//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Submit Form<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
button.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("cover-spin").style="display:inherit";
    var fileid;
    //>>>Upoading Image 
    var file = document.getElementById("file").files[0];
    var fileType = file.type;
    var config = {
        CONTENT_TYPE: "multipart",
        PARTS: [
            {
                headers: {
                    "Content-Disposition": "file;",
                },
                content: "__FILE__",
            },
        ],
        FILE: {
            fileParam: "content",
            file: file,
        },
    };

    ZOHO.CRM.API.uploadFile(config).then(function (resp) {
        
        console.log("uploaded file");
        console.log(resp);
        fileid = resp.data[0].details.id;
        console.log(`fileid=${fileid}`);
        var recordData = {
            Name: document.getElementById("docname").value,
            Document_Type: document.getElementById("filetype").value,
            Lead: leadId,
            Document: [{ file_id: fileid }],
            Document_Status: document.getElementById("filestatus").value,
        };
        ZOHO.CRM.API.insertRecord({
            Entity: "Candidate_Documents",
            APIData: recordData,
            Trigger: ["workflow"],
        }).then(function (data) {
            console.log(data);
            fetchData();
            controlButton();
            document.getElementById("inputform").reset();
            document.getElementById("table").classList.remove("hide");
            document.getElementById("cover-spin").style="display:none";
        });
    });
});


//>>>>>>>>>>>>>>Uploading file from modal window.This should be refactored with file upload in add new record <<<<<<<<<<

modalSubmitButton.addEventListener("click", () => {
    var id= document.getElementById("uploadrecordId").value;
    console.log("id");
    console.log(id);
    
//////////////////Delete file///////////////
   var deltfile= {
      
        "data": [
            {
                "Candidate_Documents": [
                    {
                        "id":"4995768000000605118",
                        "attachment_id": "4995768000000605119",
                        "_delete": null
                    },   
                ]
            }
        
        ],
    
  }
  console.log(deltfile);
   ZOHO.CRM.API.updateRecord(deltfile)
   .then(function(resp){
       console.log("file delete API excecuted ");
       console.log(resp);


//////////////uploading New FIle//////////////////////
       var recordid = document.getElementById("uploadrecordId").value;
       var modalfile = document.getElementById("modaluploadfile").files[0];
   
       console.log("record id");
       console.log(recordid);
   
       var modal_upload_config = {
           CONTENT_TYPE: "multipart",
           PARTS: [
               {
                   headers: {
                       "Content-Disposition": "file;",
                   },
                   content: "__FILE__",
               },
           ],
           FILE: {
               fileParam: "content",
               file: modalfile,
           },
       };
       ZOHO.CRM.API.uploadFile(modal_upload_config).then(function(resp){
        console.log("uploaded file");
        console.log(resp);
        var uploadedfileid = resp.data[0].details.id;
        console.log(`uploadedfileid=${uploadedfileid}`);
////////////////update edited records///////////////////
        var config={
            Entity:"Candidate_Documents",
            APIData: 
                 {  id: document.getElementById("uploadrecordId").value,
                    Name: document.getElementById("modaldocname").value,
                    Document_Type: document.getElementById("modalfiletype").value,
                    Document_Status: document.getElementById("modalfilestatus").value,
                    Lead: leadId,
                    Document: [{ file_id: uploadedfileid }],

                    file_Name: document.getElementById("modaluploadfile").value,
                 },
                   
            Trigger:["workflow"]
          }
          console.log(config);
          ZOHO.CRM.API.updateRecord(config).then(function(data){
            console.log("update API executed")
            console.log(data)
            
          fetchData();
          })
       })

    })
    .catch(err => {
        console.error(err)
        console.log(deltfile)
    })

});


/////////////////////////Preview modal///////////////////////////////


//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Remark Modal handling<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
//>>>>>>>>>>>closing remark modal
var closeRemarkModal = document.getElementById("closeremark");
closeRemarkModal.addEventListener("click", () => {
    let recid = document.getElementById("remarkrecordId").value;
    document.getElementById(recid).value = "Received";
});
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Remark Submit <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
var remarksubmit = document.getElementById("remarksubmit");
remarksubmit.addEventListener("click", () => {
    var config = {
        Entity: "Candidate_Documents",
        APIData: {
            id: document.getElementById("remarkrecordId").value,
            Document_Status: "Verified",
            Remarks: document.getElementById("remark").value,
        },
    };
    console.log(config);
    ZOHO.CRM.API.updateRecord(config).then(function (data) {
        console.log(data);
    });
});



ZOHO.embeddedApp.init();


// //Get instance of RecordOperations Class
// let recordOperations = new ZCRM.Record.Operations();
// //Get instance of BodyWrapper Class that will contain the request body
// let request = new ZCRM.Record.Model.BodyWrapper();
// //Array to hold Record instances
// let recordsArray = [];
// let record1 = new ZCRM.Record.Model.Record();
// //ID of the record to be updated
// record1.setId(34770619074373n);
// /*
//  * Call addFieldValue method that takes two arguments
//  * 1 -> Call Field "." and choose the module from the displayed list and press "." and choose the field name from the displayed list.
//  * 2 -> Value
//  */
// record1.addFieldValue(ZCRM.Record.Model.Field.Leads.CITY, "City");
// record1.addFieldValue(ZCRM.Record.Model.Field.Leads.LAST_NAME, "Last Name");
// record1.addFieldValue(ZCRM.Record.Model.Field.Leads.FIRST_NAME, "First Name");
// record1.addFieldValue(ZCRM.Record.Model.Field.Leads.COMPANY, "KKRNP");
// /*
//  * Call addKeyValue method that takes two arguments
//  * 1 -> A string that is the Field's API Name
//  * 2 -> Value
//  */
// record1.addKeyValue("Custom_field", "Custom val");
// record1.addKeyValue("Custom_field_2", 10);
// //Used when GDPR is enabled
// let dataConsent = new ZCRM.Record.Model.Consent();
// dataConsent.setConsentRemarks("Approved.");
// dataConsent.setConsentThrough("Email");
// dataConsent.setContactThroughEmail(true);
// dataConsent.setContactThroughSocial(false);
// record1.addKeyValue("Data_Processing_Basis_Details", dataConsent);
// recordsArray.push(record1);
// let record2 = new ZCRM.Record.Model.Record();
// //ID of the record to be updated
// record2.addFieldValue(ZCRM.Record.Model.Field.Leads.ID, 34096431881002n);
// /*
//  * Call addFieldValue method that takes two arguments
//  * 1 -> Call Field "." and choose the module from the displayed list and press "." and choose the field name from the displayed list.
//  * 2 -> Value
//  */
// record2.addFieldValue(ZCRM.Record.Model.Field.Leads.CITY, "City");
// record2.addFieldValue(ZCRM.Record.Model.Field.Leads.LAST_NAME, "Last Name");
// record2.addFieldValue(ZCRM.Record.Model.Field.Leads.FIRST_NAME, "First Name");
// record2.addFieldValue(ZCRM.Record.Model.Field.Leads.COMPANY, "KKRNP");
// /*
//  * Call addKeyValue method that takes two arguments
//  * 1 -> A string that is the Field's API Name
//  * 2 -> Value
//  */
// record2.addKeyValue("Custom_field", "Value");
// record2.addKeyValue("Custom_field_2", "value");
// //Add Record instance to the array
// recordsArray.push(record2);
// //Set the array to data in BodyWrapper instance
// request.setData(recordsArray);
// let trigger = [];
// trigger.push("approval");
// trigger.push("workflow");
// trigger.push("blueprint");
// //Set the array containing the trigger operations to be run
// request.setTrigger(trigger);
// //Call updateRecords method that takes BodyWrapper instance and moduleAPIName as parameter.
// let response = await recordOperations.updateRecords(moduleAPIName, request);
//Get instance of AttachmentsOperations Class that takes recordId and moduleAPIName as parameter

// let attachmentsOperations = new ZCRM.Attachment.Operations(moduleAPIName, recordId);
// //Get instance of ParameterMap Class
// let paramInstance = new ParameterMap();
// for(let attachmentId of attachmentIds) {
//     //Add the ids to parameter map instance
//     await paramInstance.add(ZCRM.Attachment.Model.DeleteAttachmentsParam.IDS, attachmentId);
// }
// //Call deleteAttachments method that takes paramInstance as parameter
// let response = await attachmentsOperations.deleteAttachments(paramInstance);