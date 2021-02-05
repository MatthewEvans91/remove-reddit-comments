// this is the code which will be injected into a given page...

/*
Give the user the chance to quit the process.  We could probably do this with a cool GUI or something, but hey, here we are.
*/
(function () {
  alert("This will remove all of your comments, close tab to stop.....");
  removeAllComments();
})();
/*
This function will remove all of the current users comments.
You must be logged in, and your browser/tab must be on a reddit.com page.
*/
async function removeAllComments() {
  let userIdentity = await getUserIdentity();
  let commentList = await getUserCommentList(userIdentity);
  let iteration = 0; //for debug/testing
  while (commentList.length >= 1) {
    console.log("Got " + commentList.length + " comments");
    iteration++;
    await removeThings(commentList, userIdentity);
    commentList = await getUserCommentList(userIdentity);
  }
}
/*
Fetch the user identity.  We need both the username, and the modhash.
The username is requried to fetch the comments list, and the modhash is used to delete the comments.
*/
function getUserIdentity() {
  return new Promise((resolve) => {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        let response = JSON.parse(this.responseText); //convert the result into JSON
        //we only want to use two parameters, so lets just return an object with those two items.
        let userIdentity = {
          name: response.data.name,
          modhash: response.data.modhash,
        };
        resolve(userIdentity);
      }
    };
    let targetURL = "/api/me.json";
    xhttp.open("GET", targetURL, true);
    xhttp.send();
  });
}
/*
This fetches the given users comments & returns a list of thingID's.  The thingID's are used later when we remove comments.
*/
function getUserCommentList(userIdentity) {
  const APILIMIT = 100;

  return new Promise((resolve) => {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        let response = JSON.parse(this.responseText); //convert the result into JSON
        let thingList = response.data.children.map((x) => x.data.name); //get an array of all the "thing ID's" or whatever they're called.  They can be utilized to delete comments.
        resolve(thingList);
      }
    };
    let targetURL =
      "/user/" + userIdentity.name + "/comments.json?limit=" + APILIMIT;
    xhttp.open("GET", targetURL, true);
    xhttp.send();
  });
}
/*
This accepts a list of things, along with a userIdentity (must contain a modhash) and spins off processess to remove those things.
In this case, those "things" are comments.
*/
function removeThings(thingList, userIdentity) {
  return new Promise(async (resolve) => {
    let promiseArray = [];
    thingList.forEach((thingId) => {
      console.log("Removing comment: " + thingId);
      promiseArray.push(removeThing(thingId, userIdentity));
    });
    await Promise.all(promiseArray);
    resolve();
  });
}
/*
This accepts a thing ID and userIdentiy and removes it.  The userIdentity must contain a modhash.
*/
function removeThing(thingId, userIdentity) {
  return new Promise((resolve) => {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        let response = JSON.parse(this.responseText); //convert the result into JSON
        resolve(response);
      }
    };
    let targetURL = "/api/del";
    xhttp.open("POST", targetURL, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("id=" + thingId + "&uh=" + userIdentity.modhash); //id & uh
  });
}
