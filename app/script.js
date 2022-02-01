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
                var dwnldlink= element.Document[0].download_Url;
                var previewtable= document.createElement("a");
                previewtable.href = "https://crm.zoho.com"+ dwnldlink;
                previewtable.className = "btn info";
                previewtable.innerHTML = "Preview";
                previewtable.target = "_blank";
                cell1.appendChild( previewtable);


                cell2.innerHTML = element.Document_Type;
                cell2.style = "max-width: 35px;";
                cell3.style = "max-width: 35px;";
                if (element.Document) {
                    
                    cell3.innerHTML = element.Document[0].file_Name;}
                    else if(modalSubmitButton.click==true){
                        cell3.innerHTML= element.data[0].details.name;
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
                        console.log(element);
                        var fileId = element.Document[0].file_Id;
                        console.log(fileId);
                        document.getElementById("uploadrecordId").value = element.id;
                        document.getElementById("attachmentId").value= element.Document[0].attachment_Id;
                        
                        document.getElementById("modaldocname").value= element.Name;
                        document.getElementById("modalfiletype").value= element.Document_Type;
                        document.getElementById("modalfilestatus").value= element.Document_Status;
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
    // console.log("Clicked on Toggle Button");
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

         console.log("uploaded file for first time");
        // console.log(resp);
        fileid = resp.data[0].details.id;
        console.log(`uploaded fileid first time=${fileid}`);
        // console.log(fileid);
        var recordData = {
            Name: document.getElementById("docname").value,
            Document_Type: document.getElementById("filetype").value,
            Lead: leadId,
            File_Upload_Id: fileid,
            Document: [{ file_id: fileid }],
            Document_Status: document.getElementById("filestatus").value,
        };
        ZOHO.CRM.API.insertRecord({
            Entity: "Candidate_Documents",
            APIData: recordData,
            Trigger: ["workflow"],
        }).then(function (data) {
            console.log("candidate doc record creation =")
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

    var uploadRecrdId=  document.getElementById("uploadrecordId").value;
       console.log(`candidate doc record id=${uploadRecrdId}`);
       var attId= document.getElementById("attachmentId").value;
       console.log(`attchmnt server id needs to be deleted =${attId}`);
//**To remove previous uploaded file **//
       var config={

        Entity:"Candidate_Documents",
      
        APIData:{
      
              "id":  uploadRecrdId,
      
              "Document":[{"attachment_id": attId,
                            "_delete":null}]
      
        },
      
        Trigger:["workflow"]
      
      }
      
      ZOHO.CRM.API.updateRecord(config)
      
      .then(function(data){
      
        console.log(data)
      
        var recordid = document.getElementById("uploadrecordId").value;
        var modalfile = document.getElementById("modaluploadfile").files[0];
        
///// To Upload New File //////// 
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

         ZOHO.CRM.API.uploadFile(modal_upload_config).then(function (resp) {
        console.log("new file uploaded to server");
        console.log(resp);
        var uploadedfileid = resp.data[0].details.id;
        console.log(`newly uploaded server fileid=${uploadedfileid}`);
///////// Modal record updating//////        
        var config={
            Entity:"Candidate_Documents",
            APIData:{
                id :  document.getElementById("uploadrecordId").value, 
                Document :[uploadedfileid],
                Name : document.getElementById("modaldocname").value,
                Document_Type: document.getElementById("modalfiletype").value,
                Document_Status : document.getElementById("modalfilestatus").value 
          },
            
          }
          console.log("payload for newly upload")
          console.log(config);
          ZOHO.CRM.API.updateRecord(config)
          .then(function(data){
              console.log("update API executed")
              console.log(data)

            fetchData();
          })
    })
 
 });
})
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
