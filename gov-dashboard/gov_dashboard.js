'use strict';

// Import the functions you need from the SDKs you need
import {
  initializeApp,
  getFirestore,
  doc,
  collection,
  getDocs,
  updateDoc,
  firebaseConfig
} from '../common/modules/module.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// firestore data collection ref
const reportsColRef = collection(db, 'Reports');

// get <div> element to display <ul>, <li>
const appendDiv = document.getElementById('append-div');

// get reports objects and store them in a array
let reportsArray = [];

// get each report document
const querySnapshot = await getDocs(reportsColRef);
querySnapshot.forEach((doc) => {
  let reportObj = doc.data();
  reportsArray.push(reportObj);
})
console.log(reportsArray);


// create number and attach number at the beginning of each key of stored object to change order, and store them in another array 
let userReports = [];
let num = 1;

reportsArray.forEach((item, index) => {
  let oneTimeObj = {
    '1number': num + index,
    '2report_id': item.report_id,
    '3created_date': item.created_date,
    '4type': item.type,
    '5status': item.status,
    '6address': item.address,
    '7description': item.description,
    '8photo': item.photo,
  };
  userReports.push(oneTimeObj);
});
console.log(userReports);


// create new <ul> element to store <li> elements
// const ulEl = document.createElement('ul');
// ulEl.classList.add('table-body');

// create <li> and <img> elements and append them into <ul>
userReports.forEach(report => {
  let oneTimeValueArr = [];
  for (let key in report) {
    if (key !== 'location') {
      oneTimeValueArr.push(report[key]);
    }
  }

  // create new <ul> element to store <li> elements
  const ulEl = document.createElement('ul');
  ulEl.setAttribute('class', 'table-body-row');
  ulEl.classList.add(`table-row${num}`);

  // oneTimeValueArr.forEach(reportValue => {
  for (let i = 0; i < oneTimeValueArr.length - 3; i++) {

    // create <li> element for the first 5 items(num,reportId,reportDate,reportType,Status)
    const liEl = document.createElement('li');

    // Convert reportValue to string
    const stringValue = oneTimeValueArr[i].toString();

    // create <li> element contents for the first 5 items(num,reportId,reportDate,reportType,Status)
    if (stringValue[1] === '_') {
      liEl.setAttribute('class', 'status');
      liEl.textContent = stringValue;
    } else if (stringValue[0] === '0' && stringValue[1] === '.') {
      liEl.setAttribute('id', `reportId${num}`);
      liEl.setAttribute('class', 'reportId');
      liEl.textContent = stringValue;
    } else {
      liEl.textContent = stringValue;
    }
    ulEl.append(liEl);
  }
  num++;
  // append <ul> into <div>
  appendDiv.append(ulEl);


  // Convert reportValue to string
  const address = report['6address'];
  const detail = report['7description'];
  const photo = report['8photo'];

  // create sixth <li> for address, detail, photo
  const liEl = document.createElement('li');

  // create <div>,<span>*2 for address
  const addressDiv = document.createElement('div');
  const addressSpan1 = document.createElement('span');
  const addressSpan2 = document.createElement('span');
  addressSpan1.textContent = 'Address';
  addressSpan2.textContent = address;
  addressDiv.append(addressSpan1);
  addressDiv.append(addressSpan2);
  // create <div>,<span>*2 for detail
  const detailDiv = document.createElement('div');
  const detailSpan1 = document.createElement('span');
  const detailSpan2 = document.createElement('span');
  detailSpan1.textContent = 'Detail';
  detailSpan2.textContent = detail;
  detailDiv.append(detailSpan1);
  detailDiv.append(detailSpan2);
  // create <div>,<span>,<img> for photo
  const photoDiv = document.createElement('div');
  const photoSpan = document.createElement('span');
  photoSpan.textContent = 'Photo';
  const photoImg = document.createElement('img');
  photoImg.src = photo;
  photoImg.style.width = '40%';
  photoDiv.append(photoSpan);
  photoDiv.append(photoImg);

  liEl.append(addressDiv);
  liEl.append(detailDiv);
  liEl.append(photoDiv);

  ulEl.append(liEl);
});



// get all <li> elements with class="status" and status text(e.g. "01_New")
const statusList = document.querySelectorAll('.status');
console.log(statusList);

// create array for selected <li> items with status class
const selectedListTextArr = [];
statusList.forEach((status) => {
  selectedListTextArr.push(status.textContent);
})
console.log(selectedListTextArr);


// create <select> and <option> elements and append them into <li> 
statusList.forEach((status, index) => {

  // Check if statusList has enough elements before accessing them
  if (index < selectedListTextArr.length) {

    let selectEl = document.createElement('select');
    selectEl.id = `statusFilter-${index + 1}`;
    selectEl.classList.add('rowStatusFilter');

    // create values and text array for <option> elements
    const optionValues = ["1_New", "2_Ongoing", "3_Denied", "4_Solved"];

    // create <option> elements/values, give them status text(e.g. "01_New"), and append them to <select>
    optionValues.forEach((value) => {
      let optionEl = document.createElement('option');
      optionEl.value = value;
      optionEl.textContent = value;
      selectEl.append(optionEl);

      // choose default display value
      if (optionEl.textContent === selectedListTextArr[index]) {
        optionEl.selected = true;
      }
    })
    // clear list text
    status.innerHTML = '';
    // insert <select> tag into <li> tag
    status.append(selectEl);
  }
})



// create status filter ("All reports", "1_New", "2_Ongoing", "3_Denied", "4_Solved") on top of the table
// get <select> DOM elements for status filter

// get <select> elements for status filter
const statusFilter = document.getElementById('statusFilter');
console.log(statusFilter);
console.log(statusFilter[0]);

// set "All reports" as default item when page is reloaded
if (statusFilter.selectedOptions[0] !== statusFilter[0]) {
  statusFilter[0].selected = true;
}

// set user filter action
statusFilter.addEventListener('change', async function (event) {
  const selectedItemValue = event.target.value;
  const options = document.querySelectorAll('#statusFilter option');

  console.log(selectedItemValue);
  console.log(options);

  let selectedItemText;
  options.forEach(option => {
    if (selectedItemValue === option.value) {
      selectedItemText = option.textContent;
    }
  })
  console.log(selectedItemText);

  // clear previous reports contents displayed
  while (appendDiv.childNodes.length > 2) {
    appendDiv.removeChild(appendDiv.lastChild);
  }


  // if user selects "All Reports", page is reloaded and all status data will be displayed 
  if (selectedItemText === 'Status') {
    location.reload();
    return;

    // only selected status data are displayed when each status option is selected
  } else {

    // get reports objects and store them in a array
    let reportsArray = [];

    // get each report document
    const querySnapshot = await getDocs(reportsColRef);
    querySnapshot.forEach((doc) => {
      let reportObj = doc.data();
      if (reportObj.status === selectedItemText) {
        reportsArray.push(reportObj);
      }
    })
    console.log(reportsArray);

    // create number and attach number at the beginning of each key of stored object to change order, and store them in another array 
    let userReports = [];
    let num2 = 1;

    reportsArray.forEach((item, index) => {
      let oneTimeObj = {
        '1number': num2 + index,
        '2report_id': item.report_id,
        '3created_date': item.created_date,
        '4type': item.type,
        '5status': item.status,
        '6address': item.address,
        '7description': item.description,
        '8photo': item.photo,
      };
      userReports.push(oneTimeObj);
    });
    console.log(userReports);


    // create new <ul> element to store <li> elements
    // const ulEl = document.createElement('ul');
    // ulEl.classList.add('table-body');
    // create <li> and <img> elements and append them into <ul>


    userReports.forEach(report => {
      let oneTimeValueArr = [];
      for (let key in report) {
        if (key !== 'location') {
          oneTimeValueArr.push(report[key]);
        }
      }

      // create new <ul> element to store <li> elements
      const ulEl = document.createElement('ul');
      ulEl.setAttribute('class', 'table-body-row');
      ulEl.classList.add(`table-row${num2}`);

      // oneTimeValueArr.forEach(reportValue => {
      for (let i = 0; i < oneTimeValueArr.length - 3; i++) {

        // create <li> element for the first 5 items(num,reportId,reportDate,reportType,Status)
        const liEl = document.createElement('li');

        // Convert reportValue to string
        const stringValue = oneTimeValueArr[i].toString();

        // create <li> element contents for the first 5 items(num,reportId,reportDate,reportType,Status)
        if (stringValue[1] === '_') {
          liEl.setAttribute('class', 'status');
          liEl.textContent = stringValue;
        } else if (stringValue[0] === '0' && stringValue[1] === '.') {
          liEl.setAttribute('id', `reportId${num2}`);
          liEl.setAttribute('class', 'reportId');
          liEl.textContent = stringValue;
        } else {
          liEl.textContent = stringValue;
        }
        ulEl.append(liEl);
      }
      num2++;
      // append <ul> into <div>
      appendDiv.append(ulEl);


      // Convert reportValue to string
      const address = report['6address'];
      const detail = report['7description'];
      const photo = report['8photo'];

      // create sixth <li> for address, detail, photo
      const liEl = document.createElement('li');

      // create <div>,<span>*2 for address
      const addressDiv = document.createElement('div');
      const addressSpan1 = document.createElement('span');
      const addressSpan2 = document.createElement('span');
      addressSpan1.textContent = 'Address';
      addressSpan2.textContent = address;
      addressDiv.append(addressSpan1);
      addressDiv.append(addressSpan2);
      // create <div>,<span>*2 for detail
      const detailDiv = document.createElement('div');
      const detailSpan1 = document.createElement('span');
      const detailSpan2 = document.createElement('span');
      detailSpan1.textContent = 'Detail';
      detailSpan2.textContent = detail;
      detailDiv.append(detailSpan1);
      detailDiv.append(detailSpan2);
      // create <div>,<span>,<img> for photo
      const photoDiv = document.createElement('div');
      const photoSpan = document.createElement('span');
      photoSpan.textContent = 'Photo';
      const photoImg = document.createElement('img');
      photoImg.src = photo;
      photoImg.style.width = '40%';
      photoDiv.append(photoSpan);
      photoDiv.append(photoImg);

      liEl.append(addressDiv);
      liEl.append(detailDiv);
      liEl.append(photoDiv);

      ulEl.append(liEl);
    });



    // get all <li> elements with class="status" and status text(e.g. "01_New")
    let statusList = document.querySelectorAll('.status');
    console.log(statusList);

    // create array for selected list items with status class
    let selectedListTextArr = [];
    statusList.forEach((status) => {
      selectedListTextArr.push(status.textContent);
    })
    console.log(selectedListTextArr);


    // create <select> and <option> elements and append them into <li> 
    statusList.forEach((status, index) => {

      // Check if statusList has enough elements before accessing them
      if (index < selectedListTextArr.length) {

        let selectEl = document.createElement('select');
        selectEl.id = `statusFilter-${index + 1}`;
        selectEl.classList.add('rowStatusFilter');

        // create values and text array for <option> elements
        const optionValues = ["1_New", "2_Ongoing", "3_Denied", "4_Solved"];

        // create <option> elements/values, give them status text(e.g. "01_New"), and append them to <select>
        optionValues.forEach((value) => {
          let optionEl = document.createElement('option');
          optionEl.value = value;
          optionEl.textContent = value;
          selectEl.append(optionEl);

          // choose default display value
          if (optionEl.textContent === selectedListTextArr[index]) {
            optionEl.selected = true;
          }
        })
        // clear list text
        status.innerHTML = '';
        // insert <select> tag into <li> tag
        status.append(selectEl);
        console.log(status);
      }
    })



    // status change filter in each row (change status only after using the filter on top of the table)

    // get DOMs for each row's status change filter
    const rowStatusChangeFilter = document.querySelectorAll('.rowStatusFilter');
    console.log(rowStatusChangeFilter);

    // get DOMs for each row's report id element
    const reportIdList = document.querySelectorAll('.reportId');
    console.log(reportIdList);

    // get document id of each row's report id element
    let reportIdArray = [...reportIdList].map(reportId => reportId.textContent);
    console.log(reportIdArray);

    // set empty array for bulk edit
    let oneTimeReportIdArray = [];


    // set the status change action on <select> in each row
    rowStatusChangeFilter.forEach((selectEl) => {
      selectEl.addEventListener('change', async function (event) {
        const selectedItem = event.target;
        const selectedItemValue = await event.target.value;
        console.log(selectedItem);
        console.log(selectedItemValue);

        // get displayed order number from <select> id name (statusFilter number, e.g. 1,2,3...) 
        let selectItemNum = selectedItem.id.slice(-1);
        // get displayed order number from <li> id name (reportId number, e.g. 1,2,3...)
        let selectReportNum = reportIdList[selectItemNum - 1].id.slice(-1);
        console.log(selectReportNum);

        // specify the document id (report id) for selected status change filter, and store the specified id in an array
        let reportId;
        if (selectItemNum === selectReportNum) {
          reportId = reportIdArray[selectItemNum - 1];
          oneTimeReportIdArray.push(reportId);
        }
        console.log(reportId);
        console.log(oneTimeReportIdArray);

        // get "change status" <span> element DOM
        const changeStatus = document.querySelector('.filter-changestatus .change-status-btn');

        // set the "change status" action for bulk edit at the same time
        changeStatus.addEventListener('click', function () {
          oneTimeReportIdArray.forEach(async (id) => {
            // get the specific report document id
            const updateReportRef = doc(db, "Reports", id);

            // update status with selected item 
            await updateDoc(updateReportRef, {
              "status": selectedItemValue
            });
          });
          // window.alert('Status Updated!');
        })
      })
    })


    // // get "change status" <span> element DOM
    // const changeStatus = document.querySelector('.filter-changestatus .change-status-btn');

    // // set the "change status" action for bulk edit at the same time
    // changeStatus.addEventListener('click', function () {
    //   oneTimeReportIdArray.forEach(async (id) => {

    //     // get the specific report document id
    //     const updateReportRef = doc(db, "Reports", id);

    //     // update status with selected item 
    //     await updateDoc(updateReportRef, {
    //       "status": selectedItemValue
    //     });
    //   });
    //   // window.alert('Status Updated!');
    // })



    // accordion effect(first <li> element scrolls up & down each row contents)

    // get all the first <li> elements of each row
    const lists1 = document.querySelectorAll('.table-body-row li:nth-of-type(1)');
    console.log(lists1);

    lists1.forEach(list1each => {
      list1each.addEventListener('click', function () {
        // console.log(this);
        const row = this.parentElement;
        const expandRow = row.querySelector('.table-body-row li:nth-of-type(6)');
        // console.log(expandRow);
        this.classList.toggle('open');
        expandRow.classList.toggle('open');
      })
    })
  }
})





// status change filter in each row (change status directly)

// get DOMs for each row's status change filter
const rowStatusChangeFilter = document.querySelectorAll('.rowStatusFilter');
console.log(rowStatusChangeFilter);

// get DOMs for each row's report id element
const reportIdList = document.querySelectorAll('.reportId');
console.log(reportIdList);

// get document id of each row's report id element
let reportIdArray = [...reportIdList].map(reportId => reportId.textContent);
console.log(reportIdArray);

// set empty array for bulk edit
let oneTimeReportIdArray = [];

// get "change status" <span> element DOM
const changeStatus = document.querySelector('.filter-changestatus .change-status-btn');

// set the status change action on <select> in each row
let selectedItem;
let selectedItemValue;
rowStatusChangeFilter.forEach((selectEl) => {
  selectEl.addEventListener('change', async function (event) {
    selectedItem = event.target;
    selectedItemValue = await event.target.value;
    console.log(selectedItem);
    console.log(selectedItemValue);

    // get displayed order number from <select> id name (statusFilter number, e.g. 1,2,3...) 
    let selectItemNum = selectedItem.id.slice(-1);
    // get displayed order number from <li> id name (reportId number, e.g. 1,2,3...)
    let selectReportNum = reportIdList[selectItemNum - 1].id.slice(-1);
    console.log(selectReportNum);

    // specify the document id (report id) for selected status change filter, and store the specified id in an array
    let reportId;
    if (selectItemNum === selectReportNum) {
      reportId = reportIdArray[selectItemNum - 1];
      oneTimeReportIdArray.push(reportId);
    }
    console.log(reportId);
    console.log(oneTimeReportIdArray);
  })
})


// set the "change status" action for bulk edit at the same time
changeStatus.addEventListener('click', function () {
  oneTimeReportIdArray.forEach(async (id) => {

    // get the specific report document id
    const updateReportRef = doc(db, "Reports", id);

    // update status with selected item 
    await updateDoc(updateReportRef, {
      "status": selectedItemValue
    });
  })
  window.alert('Status Updated!');
})


// accordion effect(first <li> element scrolls up & down each row contents)

// get all the first <li> elements of each row
const lists1 = document.querySelectorAll('.table-body-row li:nth-of-type(1)');
console.log(lists1);

lists1.forEach(list1each => {
  list1each.addEventListener('click', function () {
    // console.log(this);
    const row = this.parentElement;
    const expandRow = row.querySelector('.table-body-row li:nth-of-type(6)');
    // console.log(expandRow);
    this.classList.toggle('open');
    expandRow.classList.toggle('open');
  })
})