var fs = require('fs');
var csv = require('fast-csv');
var BigNumber = require('bignumber.js');

const Web3 = require('web3');


if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

let distribData = new Array();
let distribData2 = new Array();
let allocData = new Array();
let allocData2 = new Array();
let fullFileData = new Array();
let timestamps = new Array();

async function parseTimestamp() {

  console.log(`
    --------------------------------------------
    ------------ Getting Timestamps ------------
    --------------------------------------------
  `);

  //console.log("DIS",parseInt(distribData2));

  for(var i = 0;i< distribData2.length;i++){
    try{
        //console.log("DIS",Number(distribData2[i]));
        console.log("Attempting to find timestamp for block:",distribData2[i],"\n\n");
        //var blockNumber = web3.eth.blockNumber;
        //console.log("blockNumber:",blockNumber,"\n\n");

        var timestamp = web3.eth.getBlock(Number(distribData2[i])).timestamp;
        console.log("Found timestamp:",timestamp,"\n\n");

        if(timestamp != null && timestamp !='' ){
          var d = new Date(timestamp * 1000);
          var s = d.toUTCString();
          s = s.substring(0,s.indexOf("GMT")) + "UTC";
          timestamps.push(s);
        }else{
          var timestamp = '';
          timestamps.push(timestamp);
        }

    } catch (err){
      console.log("ERROR:",err);
    }
  }
  writeFile();
}


function readFile() {
  var stream = fs.createReadStream("data/input.csv");

  console.log(`
    --------------------------------------------
    ------------ Parsing csv file --------------
    --------------------------------------------
  `);

  var csvStream = csv()
      .on("data", function(data){
          if(data[0]!=null && data[0]!='' ){
             allocData.push(data[0]);
             allocData2.push(data[1]); // Block number
             fullFileData.push(data[0]);

             distribData.push(allocData);
             distribData2.push(allocData2);
             allocData = [];
             allocData2 = [];
          }
      })
      .on("end", function(){
        parseTimestamp();
      });

  stream.pipe(csvStream);
}

function writeFile() {
  var fast_csv = csv.createWriteStream();
  var writeStream = fs.createWriteStream("data/output.csv");

  console.log(`
    --------------------------------------------
    --------- Writing csv file -----------------
    --------------------------------------------
  `);

  fast_csv.pipe(writeStream);

  for(var i = 0; i < timestamps.length; i++){
    fast_csv.write( [ distribData[i],timestamps[i] ] );             //each element inside bracket
  }
  fast_csv.end();

}

console.log("Processing timestamps");
readFile();
